const Price = require('../models/price');

const createPrice = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, price, unit } = req.body;
        const newPrice = new Price({ commodityId, warehouseId, unit });
        newPrice.historicalPrices.push({ price });
        await newPrice.save();
        res.status(201).json({ status: true, message: 'Price created successfully', data: newPrice });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create price', error: error.message });
    }
};

const getAllPrices = async (req, res, next) => {
    try {
        const prices = await Price.find().populate('commodityId warehouseId');
        res.json({ status: true, message: 'Prices fetched successfully', data: prices });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch prices', error: error.message });
    }
};

const getPriceById = async (req, res, next) => {
    try {
        const price = await Price.findById(req.params.id);
        if (!price) {
            return res.status(404).json({ status: false, message: 'Price not found' });
        }
        res.json({ status: true, message: 'Price fetched successfully', data: price });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch price', error: error.message });
    }
};

const getPriceByWarehouseCommodity = async (req, res, next) => {
    try {
        const price = await Price.findOne({ warehouseId: req.params.warehouseId, commodityId: req.params.commodityId }).populate('commodityId warehouseId');
        if (!price) {
            return res.status(404).json({ status: false, message: 'Price not found' });
        }
        res.json({ status: true, message: 'Price fetched successfully', data: price });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch getPriceByWarehouseCommodity', error: error.message });
    }
};


const updatePriceById = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, price, unit } = req.body;
        const updatedPrice = await Price.findByIdAndUpdate(
            req.params.id,
            { commodityId, warehouseId, unit, $push: { historicalPrices: { price } } },
            { new: true }
        );
        if (!updatedPrice) {
            return res.status(404).json({ status: false, message: 'Price not found' });
        }
        res.json({ status: true, message: 'Price updated successfully', data: updatedPrice });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update price', error: error.message });
    }
};

const deletePriceById = async (req, res, next) => {
    try {
        const deletedPrice = await Price.findByIdAndDelete(req.params.id);
        if (!deletedPrice) {
            return res.status(404).json({ status: false, message: 'Price not found' });
        }
        res.json({ status: true, message: 'Price deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete price', error: error.message });
    }
};

module.exports = { createPrice, getAllPrices, getPriceById, getPriceByWarehouseCommodity, updatePriceById, deletePriceById };
