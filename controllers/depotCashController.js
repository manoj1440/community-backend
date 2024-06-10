const { DepotCash, Transaction } = require('../models/depotCash');
const Warehouse = require('../models/warehouse');
const mongoose = require('mongoose');
const Consignment = require('../models/consignment');
const StockOut = require('../models/stockOut');
const consignment = require('../models/consignment');

exports.addDepotCash = async (req, res) => {
    const { warehouseId, amount } = req.body;
    const userId = req.userData.user._id;
    const amountAdded = parseInt(amount);
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0];

    try {
        let existingDepotCashEntry = await DepotCash.findOne({ warehouseId }).populate('transactions');
        if (existingDepotCashEntry) {

            const todayAdminTransactions = existingDepotCashEntry.transactions.filter(transaction => {
                const transactionDate = transaction.date.toISOString().split('T')[0];
                return transaction.entityType === 'User' && transaction.type === 'Credit' && transactionDate === currentDateString;
            });

            const todayCustomerTransaction = existingDepotCashEntry.transactions.filter(transaction => {
                const transactionDate = transaction.date;
                return transaction.entityType === 'Customer' && transaction.type === 'Credit' && transactionDate === currentDate;
            })

            let closingAmount, openingAmount;
            if (todayAdminTransactions.length === 0) {
                openingAmount = existingDepotCashEntry.closingAmount + amountAdded;
                closingAmount = openingAmount;
            } else {
                openingAmount = existingDepotCashEntry.openingAmount;
                closingAmount = existingDepotCashEntry.closingAmount + amountAdded;
            }


            const newTransaction = new Transaction({
                entityId: userId,
                entityType: 'User',
                warehouseId: warehouseId,
                date: new Date(),
                amount: amountAdded,
                type: 'Credit'
            });

            await newTransaction.save();

            existingDepotCashEntry.transactions.push(newTransaction._id);
            existingDepotCashEntry.openingAmount = openingAmount;
            existingDepotCashEntry.closingAmount = closingAmount;
            existingDepotCashEntry.date = new Date();
            await existingDepotCashEntry.save();

        } else {
            const newTransaction = new Transaction({
                entityId: userId,
                entityType: 'User',
                warehouseId: warehouseId,
                date: new Date(),
                amount: amountAdded,
                type: 'Credit'
            });

            await newTransaction.save();

            const newDepotCashEntry = new DepotCash({
                warehouseId: warehouseId,
                openingAmount: amountAdded,
                closingAmount: amountAdded,
                date: new Date(),
                transactions: [newTransaction._id]
            });

            await newDepotCashEntry.save();
        }

        res.status(200).json({ message: 'Depot cash entry added successfully' });
    } catch (error) {
        console.error('Error adding depot cash:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllDepotCashEntries = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        const depotCashEntries = [];

        for (const warehouse of warehouses) {
            let depotCashEntry = await DepotCash.findOne({ warehouseId: warehouse._id })
                .populate('transactions')
                .populate('warehouseId');

            if (!depotCashEntry) {
                const newDepotCashEntry = new DepotCash({
                    warehouseId: warehouse._id,
                    openingAmount: 0,
                    closingAmount: 0,
                    date: new Date()
                });
                await newDepotCashEntry.save();
                depotCashEntries.push(newDepotCashEntry);
            } else {
                const transactions = await Transaction.find({ _id: { $in: depotCashEntry.transactions } })
                    .populate('entityId', '-password');

                depotCashEntry = depotCashEntry.toObject();
                depotCashEntry.transactions = transactions;

                depotCashEntries.push(depotCashEntry);
            }
        }

        res.json(depotCashEntries);
    } catch (error) {
        console.error('Error fetching depot cash entries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.revertTransaction = async (req, res) => {
    const { transactionId } = req.params;
    const { consignmentId } = req.body;
    try {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const depotCashEntry = await DepotCash.findOne({ warehouseId: transaction.warehouseId });

        if (!depotCashEntry) {
            return res.status(404).json({ error: 'Depot cash entry not found' });
        }

        if (transaction.type === 'Credit') {
            depotCashEntry.closingAmount -= transaction.amount;
        } else if (transaction.type === 'Debit') {
            depotCashEntry.closingAmount += transaction.amount;
        }

        transaction.reverted = true;
        await transaction.save();

        const reversedTransaction = new Transaction({
            entityId: transaction.entityId,
            entityType: transaction.entityType,
            warehouseId: transaction.warehouseId,
            consignmentId: req.body.consignmentId,
            date: new Date(),
            amount: transaction.amount,
            type: transaction.type === 'Credit' ? 'Debit' : 'Credit',
            reverted: true,
            originalTransactionId: transaction._id
        });

        await reversedTransaction.save();

        depotCashEntry.transactions.push(reversedTransaction._id);
        await depotCashEntry.save();

        if (transaction.entityType === 'Farmer') {
            const consignment = await Consignment.findById(consignmentId);
            if (consignment) {
                const transferred = consignment.transferred.toLowerCase();
                if (transferred === 'yes') {
                    consignment.transferred = 'No';
                    consignment.transferredAt = null;
                    await consignment.save();
                }
            }
        } else if (transaction.entityType === 'Customer') {
            const consignment = await StockOut.findById(consignmentId);
            if (consignment) {
                const received = consignment.received.toLowerCase();
                if (received === 'yes') {
                    consignment.received = 'No';
                    consignment.receivedAt = null;
                    await consignment.save();
                }
            }
        }


        res.status(200).json({ message: 'Transaction reverted successfully' });
    } catch (error) {
        console.error('Error reverting transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDepotCashById = async (req, res) => {
    const { id } = req.params;
    try {
        const depotCashEntry = await DepotCash.findById(id);
        if (!depotCashEntry) {
            return res.status(404).json({ error: 'Depot cash entry not found' });
        }
        res.json(depotCashEntry);
    } catch (error) {
        console.error('Error fetching depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateDepotCashById = async (req, res) => {
    const { transactionId } = req.params;
    const { amount } = req.body;
    try {
        const transaction = await Transaction.findOne({ _id: transactionId });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const depotCash = await DepotCash.findOne({ warehouseId: transaction.warehouseId }).populate('transactions');
        if (!depotCash) {
            return res.status(404).json({ error: 'Depot Cash entry not found' });
        }

        const currentDate = new Date();
        const todayTransactions = depotCash.transactions.filter(t => {
            const transactionDate = t.date;
            return t.entityType === 'User' && t.type === 'Credit' && transactionDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0];
        });
        console.log("🚀 ~ todayTransactions ~ todayTransactions:", todayTransactions)

        const amountDifference = amount - transaction.amount;
        console.log("🚀 ~ exports.updateDepotCashById= ~ amountDifference:", amountDifference)

        if (todayTransactions.length > 0 && todayTransactions[0]._id.equals(transaction._id)) {
            depotCash.openingAmount += amountDifference;
        }

        depotCash.closingAmount += amountDifference;

        transaction.amount = amount;
        await transaction.save();
        await depotCash.save();

        res.status(200).json({ message: 'Depot cash entry updated successfully' });
    } catch (error) {
        console.error('Error updating depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.deleteDepotCashById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedDepotCashEntry = await DepotCash.findByIdAndDelete(id);
        if (!deletedDepotCashEntry) {
            return res.status(404).json({ error: 'Depot cash entry not found' });
        }
        res.json({ message: 'Depot cash entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




