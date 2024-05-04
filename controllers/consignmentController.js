const Consignment = require('../models/consignment');
const StockIn = require('../models/stockIn');

const updateStockIn = async (warehouseId, commodityId, bags, totalQuantity, amount) => {
    try {
        let stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (!stockIn) {
            stockIn = new StockIn({ warehouseId, commodityId, bags, totalQuantity, amount });
        } else {
            stockIn.bags = bags;
            stockIn.totalQuantity += totalQuantity;
            stockIn.amount += amount;
        }

        await stockIn.save();
    } catch (error) {
        throw new Error('Failed to update stock-in: ' + error.message);
    }
};

const createConsignment = async (req, res, next) => {
    try {
        const { farmerId, transporterId, warehouseId, commodity, totalAmount } = req.body;
        const newConsignment = new Consignment({ farmerId, transporterId, warehouseId, commodity, totalAmount });
        await newConsignment.save();
        for (const item of commodity) {
            await updateStockIn(warehouseId, item.commodityId, item.bags, item.totalQuantity, item.amount);
        }
        res.status(201).json({ status: true, message: 'Consignment created successfully', data: newConsignment });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create consignment', error: error.message });
    }
};

const getAllConsignments = async (req, res, next) => {
    try {
        const consignments = await Consignment.find()
            .populate('farmerId')
            .populate('transporterId')
            .populate('warehouseId')
            .populate('commodity.commodityId');

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
        const { farmerId, transporterId, warehouseId, commodity, totalAmount } = req.body;
        const consignment = await Consignment.findByIdAndUpdate(req.params.id, { farmerId, transporterId, warehouseId, commodity, totalAmount }, { new: true });
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }
        res.json({ status: true, message: 'Consignment updated successfully', data: consignment });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update consignment', error: error.message });
    }
};

const deleteConsignment = async (req, res, next) => {
    try {
        const consignment = await Consignment.findByIdAndDelete(req.params.id);
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        for (const item of consignment.commodity) {
            await updateStockIn(consignment.warehouseId, item.commodityId, item.bags.map(bag => ({ noOfBags: -bag.noOfBags, weight: -bag.weight, quantity: -bag.quantity })), -item.totalQuantity, -item.amount);
        }

        res.json({ status: true, message: 'Consignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete consignment', error: error.message });
    }
};

module.exports = { createConsignment, getAllConsignments, getConsignmentById, updateConsignment, deleteConsignment };
