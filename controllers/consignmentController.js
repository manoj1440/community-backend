const Consignment = require('../models/consignment');
const DepotCash = require('../models/depotCash');
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
                .sort({ createdAt: -1 });
        } else {
            consignments = await Consignment.find({ warehouseId: warehouseId })
                .populate('farmerId')
                .populate('transporterId')
                .populate('warehouseId')
                .populate('commodity.commodityId')
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
        const { transferred } = req.body;

        const consignment = await Consignment.findById(req.params.id);

        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        if (transferred === 'Yes') {
            const warehouseId = consignment.warehouseId;

            const depotCash = await DepotCash.findOne({ warehouseId: warehouseId });

            if (depotCash.closingAmount >= consignment.totalAmount) {

                const updatedConsignment = await Consignment.findByIdAndUpdate(
                    req.params.id,
                    { transferred, transferredAt: transferred.toLowerCase() === 'yes' ? new Date().toISOString() : null },
                    { new: true }
                );

                depotCash.closingAmount -= consignment.totalAmount;

                depotCash.transactions.push({
                    entityId: consignment.farmerId,
                    entityType: 'Farmer',
                    date: new Date(),
                    amount: consignment.totalAmount,
                    type: 'Debit'
                });

                try {

                    await depotCash.save();
                } catch (error) {
                    console.log('LOG', error)
                }


                return res.json({ status: true, message: 'Consignment updated successfully', data: consignment });
            } else {
                return res.status(200).json({ status: false, message: 'Insufficient cash balance in the depot' });
            }
        } else {
            const updatedConsignment = await Consignment.findByIdAndUpdate(
                req.params.id,
                { transferred, transferredAt: transferred.toLowerCase() === 'yes' ? new Date().toISOString() : null },
                { new: true }
            );
            return res.json({ status: true, message: 'Consignment updated successfully', data: consignment });
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


module.exports = { createConsignment, getAllConsignments, getConsignmentById, updateConsignment, deleteConsignment };
