const StockIn = require('../models/stockIn');

const getAllStockIns = async (req, res, next) => {
    try {
        const stockIns = await StockIn.find().populate('commodityId warehouseId');
        res.json({ status: true, message: 'StockIns fetched successfully', data: stockIns });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch StockIns', error: error.message });
    }
};

module.exports = { getAllStockIns };
