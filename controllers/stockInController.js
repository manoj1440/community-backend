const StockIn = require('../models/stockIn');

const createStockIn = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, quantity } = req.body;
        const stockIn = new StockIn({ commodityId, warehouseId, quantity });
        await stockIn.save();
        res.status(201).json({ status: true, message: 'StockIn created successfully', data: stockIn });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create StockIn', error: error.message });
    }
};

const getAllStockIns = async (req, res, next) => {
    try {
        const stockIns = await StockIn.find().populate('commodityId warehouseId');
        res.json({ status: true, message: 'StockIns fetched successfully', data: stockIns });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch StockIns', error: error.message });
    }
};

const getStockInById = async (req, res, next) => {
    try {
        const stockIn = await StockIn.findById(req.params.id);
        if (!stockIn) {
            return res.status(404).json({ status: false, message: 'StockIn not found' });
        }
        res.json({ status: true, message: 'StockIn fetched successfully', data: stockIn });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch StockIn', error: error.message });
    }
};

const updateStockInById = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, quantity } = req.body;
        const updatedStockIn = await StockIn.findByIdAndUpdate(req.params.id, { commodityId, warehouseId, quantity }, { new: true });
        if (!updatedStockIn) {
            return res.status(404).json({ status: false, message: 'StockIn not found' });
        }
        res.json({ status: true, message: 'StockIn updated successfully', data: updatedStockIn });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update StockIn', error: error.message });
    }
};

const deleteStockInById = async (req, res, next) => {
    try {
        const deletedStockIn = await StockIn.findByIdAndDelete(req.params.id);
        if (!deletedStockIn) {
            return res.status(404).json({ status: false, message: 'StockIn not found' });
        }
        res.json({ status: true, message: 'StockIn deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete StockIn', error: error.message });
    }
};

const updateQuantityByWarehouseAndCommodity = async (req, res, next) => {
    try {
        const { warehouseId, commodityId, quantity } = req.body;
        const stockIn = await StockIn.findOne({ warehouseId, commodityId });
        if (!stockIn) {
            return res.status(404).json({ status: false, message: 'StockIn not found for the given warehouse and commodity' });
        }
        stockIn.quantity = quantity;
        await stockIn.save();
        res.json({ status: true, message: 'Quantity updated successfully', data: stockIn });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update quantity', error: error.message });
    }
};

module.exports = { createStockIn, getAllStockIns, getStockInById, updateStockInById, deleteStockInById, updateQuantityByWarehouseAndCommodity };
