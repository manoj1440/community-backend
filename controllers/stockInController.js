const StockIn = require('../models/stockIn');

const getAllStockIns = async (req, res, next) => {
    try {
        const stockIns = await StockIn.find().populate('commodityId warehouseId');
        res.json({ status: true, message: 'StockIns fetched successfully', data: stockIns });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch StockIns', error: error.message });
    }
};

const getStockInsByWarehouseId = async (req, res, next) => {
    try {
        const { warehouseId } = req.params;
        const stockIns = await StockIn.find({ warehouseId }).populate('commodityId warehouseId');

        if (stockIns.length === 0) {
            return res.status(404).json({ status: false, message: 'stockIns not found for the given warehouseId' });
        }

        res.json({ status: true, message: 'stockIns fetched successfully', data: stockIns });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch stockIns by warehouseId', error: error.message });
    }
};

module.exports = { getAllStockIns, getStockInsByWarehouseId };
