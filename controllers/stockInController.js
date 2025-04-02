const StockIn = require('../models/stockIn');
const getFinancialYear = require('../utils/financialYear');

const getAllStockIns = async (req, res, next) => {
    try {
        const { financialYear: requestedYear } = req.query;
        const currentFinancialYear = getFinancialYear();

        if (requestedYear && !/^\d{4}-\d{4}$/.test(requestedYear)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid financial year format. Use "YYYY-YYYY"'
            });
        }

        const targetYear = requestedYear || currentFinancialYear;

        const stockIns = await StockIn.find({ financialYear: targetYear })
            .populate('commodityId warehouseId');

        res.json({
            status: true,
            message: `StockIns for financial year ${targetYear} fetched successfully`,
            data: stockIns
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch StockIns', error: error.message });
    }
};

const getStockInsByWarehouseId = async (req, res, next) => {
    try {
        const { warehouseId } = req.params;
        const { financialYear: requestedYear } = req.query;
        const currentFinancialYear = getFinancialYear();

        if (requestedYear && !/^\d{4}-\d{4}$/.test(requestedYear)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid financial year format. Use "YYYY-YYYY"'
            });
        }

        const targetYear = requestedYear || currentFinancialYear;

        const stockIns = await StockIn.find({
            warehouseId,
            financialYear: targetYear
        }).populate('commodityId warehouseId');

        if (stockIns.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No stock entries found for this warehouse and financial year'
            });
        }

        res.json({
            status: true,
            message: `StockIns for financial year ${targetYear} fetched successfully`,
            data: stockIns
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch stockIns', error: error.message });
    }
};

module.exports = { getAllStockIns, getStockInsByWarehouseId };
