const StockOut = require('../models/stockOut');
const StockIn = require('../models/stockIn');
const { DepotCash, Transaction } = require('../models/depotCash');
const getFinancialYear = require('../utils/financialYear');

const updateStockIn = async (warehouseId, commodityId, totalQuantity) => {
    try {
        const financialYear = getFinancialYear();

        let stockIn = await StockIn.findOne({ warehouseId, commodityId, financialYear });

        if (!stockIn) {
            stockIn = new StockIn({ warehouseId, commodityId, totalQuantity, financialYear });
        } else {
            stockIn.totalQuantity += totalQuantity;

            if (stockIn.totalQuantity <= 0) {
                stockIn.totalQuantity = 0;
            }
        }

        await stockIn.save();
    } catch (error) {
        throw new Error('Failed to update stock-in: ' + error.message);
    }
};

// Create a new StockOut
const createStockOut = async (req, res) => {
    try {
        const financialYear = getFinancialYear();
        const userId = req.userData.user._id;
        await updateStockIn(req.body.warehouseId, req.body.commodityId, -req.body.totalQuantity);

        const newStockOut = await StockOut.create({ ...req.body, createdBy: userId, financialYear: financialYear });

        res.status(201).json({
            status: true,
            message: 'StockOut created successfully',
            data: newStockOut,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'Failed to create StockOut',
            error: error.message,
        });
    }
};

// Get all StockOuts
const getAllStockOuts = async (req, res) => {
    try {
        const requestedFinancialYear = req.query.financialYear;
        const financialYear = requestedFinancialYear || getFinancialYear();

        const warehouseId = req.userData.user.warehouseId._id;
        const role = req.userData.user.role;

        let query = { financialYear };

        if (role === 'ADMIN') {
            const stockOuts = await StockOut.find(query).populate('warehouseId customerId commodityId').sort({ createdAt: -1 });
            res.json({
                status: true,
                message: 'StockOuts fetched successfully',
                data: stockOuts,
            });
        } else {
            const stockOuts = await StockOut.find({ warehouseId: warehouseId }).populate('warehouseId customerId commodityId').sort({ createdAt: -1 });
            res.json({
                status: true,
                message: 'StockOuts fetched successfully',
                data: stockOuts,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to fetch StockOuts',
            error: error.message,
        });
    }
};

// Get a single StockOut by ID
const getStockOutById = async (req, res) => {
    try {
        const stockOut = await StockOut.findById(req.params.id).populate('warehouseId customerId commodityId');
        if (!stockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }
        res.json({
            status: true,
            message: 'StockOut fetched successfully',
            data: stockOut,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to fetch StockOut',
            error: error.message,
        });
    }
};

const updateStockOut = async (req, res) => {
    try {
        const { received, totalQuantity, rate, amount, totalReceivedQuantity, receivedAmount } = req.body;

        let receivedAt;

        if (received !== undefined) {
            receivedAt = received.toLowerCase() === 'yes' ? new Date().toISOString() : null;
        }

        const updateData = received !== undefined ? { received, receivedAt } : {
            totalQuantity,
            rate,
            amount,
            totalReceivedQuantity,
            receivedAmount
        };

        const updatedStockOut = await StockOut.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedStockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }

        if (received) {
            if (received.toLowerCase() === 'yes') {
                const warehouseId = updatedStockOut.warehouseId;
                const depotCash = await DepotCash.findOne({ warehouseId, financialYear: updatedStockOut.financialYear });

                if (depotCash) {
                    depotCash.closingAmount += updatedStockOut.receivedAmount;

                    const newTransaction = new Transaction({
                        entityId: updatedStockOut.customerId,
                        entityType: 'Customer',
                        warehouseId: updatedStockOut.warehouseId,
                        consignmentId: updatedStockOut._id,
                        date: new Date(),
                        amount: updatedStockOut.receivedAmount,
                        type: 'Credit',
                        reverted: false,
                        financialYear: updatedStockOut.financialYear,
                    });

                    await newTransaction.save();
                    depotCash.transactions.push(newTransaction._id);
                    await depotCash.save();
                } else {
                    console.log('DepotCash not found for warehouseId:', warehouseId);
                }
            } else if (received.toLowerCase() === 'no') {

                const transaction = await Transaction.findOne({ consignmentId: req.params.id, reverted: false });

                if (transaction) {
                    const depotCash = await DepotCash.findOne({ warehouseId: transaction.warehouseId, financialYear: updatedStockOut.financialYear });
                    if (depotCash) {
                        depotCash.closingAmount -= transaction.amount;
                        transaction.reverted = true;

                        const reversedTransaction = new Transaction({
                            entityId: transaction.entityId,
                            entityType: transaction.entityType,
                            warehouseId: transaction.warehouseId,
                            consignmentId: req.params.id,
                            date: new Date(),
                            amount: transaction.amount,
                            type: transaction.type === 'Credit' ? 'Debit' : 'Credit',
                            reverted: true,
                            originalTransactionId: transaction._id,
                            financialYear: updatedStockOut.financialYear,
                        });
                        depotCash.transactions.push(reversedTransaction._id);

                        await Promise.all([transaction.save(), reversedTransaction.save(), depotCash.save()]);
                    }
                }
                const updatedConsignment = await StockOut.findByIdAndUpdate(
                    req.params.id,
                    { transferred: 'No', transferredAt: null },
                    { new: true }
                );
                return res.json({ status: true, message: 'StockOut updated successfully', data: updatedConsignment });
            }

        }
        res.json({
            status: true,
            message: 'StockOut updated successfully',
            data: updatedStockOut,
        });
    } catch (error) {
        console.error('Error updating StockOut:', error);
        res.status(400).json({
            status: false,
            message: 'Failed to update StockOut',
            error: error.message,
        });
    }
};


// Delete a StockOut by ID
const deleteStockOut = async (req, res) => {
    try {
        const deletedStockOut = await StockOut.findByIdAndDelete(req.params.id);
        if (!deletedStockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }
        await updateStockIn(deletedStockOut.warehouseId, deletedStockOut.commodityId, deletedStockOut.totalQuantity);

        res.json({
            status: true,
            message: 'StockOut deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to delete StockOut',
            error: error.message,
        });
    }
};

module.exports = {
    createStockOut,
    getAllStockOuts,
    getStockOutById,
    updateStockOut,
    deleteStockOut,
};