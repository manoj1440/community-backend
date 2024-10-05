const Consignment = require('../models/consignment');
const { DepotCash, Transaction } = require('../models/depotCash');
const StockIn = require('../models/stockIn');

const updateStockIn = async (warehouseId, commodityId, totalQuantity) => {
    try {
        let stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (!stockIn) {
            stockIn = new StockIn({ warehouseId, commodityId, totalQuantity });
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

const createConsignment = async (req, res, next) => {
    try {
        const { farmerId, transporterId, warehouseId, commodity, totalAmount } = req.body;
        const userId = req.userData.user._id;

        for (const item of commodity) {
            await updateStockIn(warehouseId, item.commodityId, item.totalQuantity);
        }
        const newConsignment = new Consignment({ farmerId, transporterId, warehouseId, commodity, totalAmount, createdBy: userId });
        await newConsignment.save();
        res.status(201).json({ status: true, message: 'Consignment created successfully', data: newConsignment });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create consignment', error: error.message });
    }
};

const createConsignmentWebsite = async (req, res, next) => {
    try {
        const { farmerId, transporterId, warehouseId, commodityId, noOfBags, weight, quantity, rate, amount, date } = req.body;

        const userId = req.userData.user._id;

        const commoditiesData = {
            commodityId: commodityId,
            bags: [{
                noOfBags: noOfBags,
                weight: weight,
                quantity: quantity
            }],
            totalQuantity: quantity,
            amount: amount
        };

        await updateStockIn(warehouseId, commodityId, quantity);

        const newConsignment = new Consignment({
            farmerId,
            transporterId,
            warehouseId,
            commodity: commoditiesData,
            totalAmount: amount,
            createdBy: userId,
            createdAt: date,
            updatedAt: date
        });

        await newConsignment.save();

        res.status(201).json({
            status: true,
            message: 'Consignment created successfully',
            data: newConsignment
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'Failed to create consignment',
            error: error.message
        });
    }
}

const getConsignmentsForWebsite = async (req, res) => {
    try {
        const warehouseId = req.userData.user.warehouseId._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const farmerId = req.query.farmerId;
        const filterWarehouseId = req.query.warehouseId;
        const commodityId = req.query.commodityId;
        const createdBy = req.query.createdBy;
    
        const query = {};

        if (req.query.dateRange) {
            const dateMatches = req.query.dateRange.match(/(\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT)/g);

            if (dateMatches && dateMatches.length === 2) {
                const [startDate, endDate] = dateMatches.map(date => new Date(date.trim()));

                const startOfDate = new Date(startDate.setUTCHours(0, 0, 0, 0));
                const endOfDate = new Date(endDate.setUTCHours(23, 59, 59, 999));
                
                query.createdAt = {
                    $gte: startOfDate,
                    $lt: new Date(endOfDate.getTime() + 1)
                };
            } else {
                console.error("Invalid date range format.");
            }
        }
        if (filterWarehouseId) {
            query.warehouseId = filterWarehouseId;
        }
        if (farmerId) {
            query.farmerId = farmerId;
        }
        if (commodityId) {
            query['commodity.commodityId'] = commodityId;
        }
        if (createdBy) {
            query.createdBy = createdBy;
        }

        console.log(query);

        let consignments = await Consignment.find(query)
            .populate('farmerId')
            .populate('transporterId')
            .populate('warehouseId')
            .populate('commodity.commodityId')
            .populate('createdBy')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await Consignment.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            status: true,
            message: 'Consignments fetched successfully',
            data: consignments,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount,
                limit: limit,
            },
        });
    } catch (error) {
        console.log('error===', error);
        res.status(500).json({ status: false, message: 'Failed to fetch consignments', error: error.message });
    }
};

const getAllConsignments = async (req, res, next) => {
    try {
        const warehouseId = req.userData.user.warehouseId._id;
        const role = req.userData.user.role;
        let consignments;
        if (role === 'ADMIN') {
            consignments = await Consignment.find()
                .populate('farmerId')
                .populate('transporterId')
                .populate('warehouseId')
                .populate('commodity.commodityId')
                .populate('createdBy')
                .sort({ createdAt: -1 });
        } else {
            consignments = await Consignment.find({ warehouseId: warehouseId })
                .populate('farmerId')
                .populate('transporterId')
                .populate('warehouseId')
                .populate('commodity.commodityId')
                .populate('createdBy')
                .sort({ createdAt: -1 });
        }
        res.json({ status: true, message: 'Consignments fetched successfully', data: consignments });
    } catch (error) {
        console.log('error===', error);
        res.status(500).json({ status: false, message: 'Failed to fetch consignments', error: error.message });
    }
};

const getConsignmentById = async (req, res, next) => {
    try {
        const consignment = await Consignment.findById(req.params.id);
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }
        res.json({ status: true, message: 'Consignment fetched successfully', data: consignment });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch consignment', error: error.message });
    }
};

const updateConsignment = async (req, res, next) => {
    try {
        let { transferred } = req.body;

        transferred = transferred.toLowerCase();

        const consignment = await Consignment.findById(req.params.id);

        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        if (transferred === 'yes') {
            const warehouseId = consignment.warehouseId;

            const depotCash = await DepotCash.findOne({ warehouseId });

            if (!depotCash) {
                return res.status(404).json({ status: false, message: 'Depot cash entry not found' });
            }

            if (depotCash.closingAmount >= consignment.totalAmount) {
                const updatedConsignment = await Consignment.findByIdAndUpdate(
                    req.params.id,
                    { transferred: 'yes', transferredAt: new Date().toISOString() },
                    { new: true }
                );

                depotCash.closingAmount -= consignment.totalAmount;

                const newTransaction = new Transaction({
                    entityId: consignment.farmerId,
                    entityType: 'Farmer',
                    warehouseId: consignment.warehouseId,
                    consignmentId: consignment._id,
                    date: new Date(),
                    amount: consignment.totalAmount,
                    type: 'Debit'
                });

                await newTransaction.save();


                depotCash.transactions.push(newTransaction._id);
                await depotCash.save();

                return res.json({ status: true, message: 'Consignment updated successfully', data: updatedConsignment });
            } else {
                return res.status(200).json({ status: false, message: 'Insufficient cash balance in the depot' });
            }
        } else {
            const transaction = await Transaction.findOne({ consignmentId: req.params.id, reverted: false });

            if (transaction) {
                const depotCash = await DepotCash.findOne({ warehouseId: transaction.warehouseId });
                if (depotCash) {
                    depotCash.closingAmount += transaction.amount;
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
                        originalTransactionId: transaction._id
                    });
                    depotCash.transactions.push(reversedTransaction._id);

                    await Promise.all([transaction.save(), reversedTransaction.save(), depotCash.save()]);
                }
            }

            const updatedConsignment = await Consignment.findByIdAndUpdate(
                req.params.id,
                { transferred: 'No', transferredAt: null },
                { new: true }
            );

            return res.json({ status: true, message: 'Consignment updated successfully', data: updatedConsignment });
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Failed to update consignment', error: error.message });
    }
};

const deleteConsignment = async (req, res, next) => {
    try {
        const consignment = await Consignment.findByIdAndDelete(req.params.id);
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        for (const item of consignment.commodity) {
            await updateStockIn(consignment.warehouseId, item.commodityId, -item.totalQuantity);
        }

        res.json({ status: true, message: 'Consignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete consignment', error: error.message });
    }
};


module.exports = { createConsignment, getAllConsignments, getConsignmentById, updateConsignment, deleteConsignment, createConsignmentWebsite, getConsignmentsForWebsite };
