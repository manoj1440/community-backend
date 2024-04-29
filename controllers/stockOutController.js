const StockOut = require('../models/stockOut');
const StockIn = require('../models/stockIn');

const updateStockIn = async (warehouseId, commodityId, quantity) => {
    try {
        const stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (stockIn) {
            stockIn.quantity = stockIn.quantity - quantity;

            if (stockIn.quantity < 0) {
                stockIn.quantity = 0;
            }
            await stockIn.save();
        }

    } catch (error) {
        console.log('message: ', 'Failed to update quantity', 'error:', error.message);
    }
}

const deleteStockIn = async (warehouseId, commodityId, quantity) => {
    try {
        const stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (stockIn) {
            stockIn.quantity += quantity;
            await stockIn.save();
        }

    } catch (error) {
        console.log('message: ', 'Failed to update quantity', 'error:', error.message);
    }
}

const createStockOut = async (req, res, next) => {
    try {
        const { warehouseId, commodityId, customerId, quantity, sellingPrice, amount } = req.body;
        const newStockOut = new StockOut({ warehouseId, commodityId, customerId, quantity, sellingPrice, amount });
        await newStockOut.save();
        await updateStockIn(warehouseId, commodityId, quantity)
        res.status(201).json({ status: true, message: 'StockOut created successfully', data: newStockOut });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create stockOut', error: error.message });
    }
};

const getAllStockOuts = async (req, res, next) => {
    try {
        const stockOuts = await StockOut.find().populate('commodityId customerId warehouseId');
        res.json({ status: true, message: 'StockOuts fetched successfully', data: stockOuts });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch stockOuts', error: error.message });
    }
};

const getStockOutById = async (req, res, next) => {
    try {
        const stockOut = await StockOut.findById(req.params.id);
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'StockOut not found' });
        }
        res.json({ status: true, message: 'StockOut fetched successfully', data: stockOut });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch stockOut', error: error.message });
    }
};

const updateStockOut = async (req, res, next) => {
    try {
        const { received } = req.body;
        const stockOut = await StockOut.findByIdAndUpdate(req.params.id, { received, receivedAt: new Date().toISOString() }, { new: true });
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'StockOut not found' });
        }
        res.json({ status: true, message: 'StockOut updated successfully', data: stockOut });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update stockOut', error: error.message });
    }
};

const deleteStockOut = async (req, res, next) => {
    try {

        const stockOut = await StockOut.findById(req.params.id);
        if (!stockOut) {
            return res.status(404).json({ status: false, message: 'stockOut not found' });
        }

        const deletedStockOut = await StockOut.findByIdAndDelete(req.params.id);
        if (!deletedStockOut) {
            return res.status(404).json({ status: false, message: 'StockOut not found' });
        }

        await deleteStockIn(stockOut.warehouseId, stockOut.commodityId, stockOut.quantity);

        res.json({ status: true, message: 'StockOut deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete stockOut', error: error.message });
    }
};

module.exports = { createStockOut, getAllStockOuts, getStockOutById, updateStockOut, deleteStockOut };
