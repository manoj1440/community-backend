const StockOut = require('../models/stockOut');

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


const createStockOut = async (req, res, next) => {
    try {
        const { warehouseId, customerId, commodity, totalAmount } = req.body;

        for (const item of commodity) {
            await updateStockIn(warehouseId, item.commodityId, -item.totalQuantity);
        }

        const newStockOut = new StockOut({ warehouseId, customerId, commodity, totalAmount });
        await newStockOut.save();
        res.status(201).json({ status: true, message: 'Stock Out created successfully', data: newStockOut });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create Stock Out', error: error.message });
    }
};

const getAllStockOuts = async (req, res, next) => {
    try {
        const stockOuts = await StockOut.find().populate('warehouseId').populate('customerId').populate('commodity.commodityId');
        res.json({ status: true, message: 'Stock Outs fetched successfully', data: stockOuts });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch Stock Outs', error: error.message });
    }
};

const getStockOutById = async (req, res, next) => {
    try {
        const stockOut = await StockOut.findById(req.params.id).populate('warehouseId').populate('customerId').populate('commodity.commodityId');
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'Stock Out not found' });
        }
        res.json({ status: true, message: 'Stock Out fetched successfully', data: stockOut });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch Stock Out', error: error.message });
    }
};

const updateStockOut = async (req, res, next) => {
    try {
        const { received } = req.body;
        const stockOut = await StockOut.findByIdAndUpdate(req.params.id, { received, receivedAt: new Date().toISOString() }, { new: true });
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'stockOut not found' });
        }
        res.json({ status: true, message: 'stockOut updated successfully', data: stockOut });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update stockOut', error: error.message });
    }
};

const deleteStockOut = async (req, res, next) => {
    try {
        const stockOut = await StockOut.findByIdAndDelete(req.params.id);
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'Stock Out not found' });
        }

        for (const item of stockOut.commodity) {
            await updateStockIn(stockOut.warehouseId, item.commodityId, item.totalQuantity);
        }

        res.json({ status: true, message: 'Stock Out deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete Stock Out', error: error.message });
    }
};

module.exports = { createStockOut, getAllStockOuts, getStockOutById, updateStockOut, deleteStockOut };
