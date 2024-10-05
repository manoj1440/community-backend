const Price = require('../models/price');

const createPrice = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, price, unit } = req.body;

        const oldPriceData = await Price.findOne({ warehouseId, commodityId });
        if (oldPriceData) {
            return res.status(500).json({ status: false, message: 'Price Already found' });
        }

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
        const { warehouseId } = req.params;
        const prices = await Price.find({ warehouseId }).populate('commodityId');

        if (prices.length === 0) {
            return res.status(404).json({ status: false, message: 'Prices not found for the given warehouseId' });
        }

        res.json({ status: true, message: 'Prices fetched successfully', data: prices });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch prices by warehouseId', error: error.message });
    }
};

const updatePriceById = async (req, res, next) => {
    try {
        const { commodityId, warehouseId, price, unit } = req.body;

        const updatedPrice = await Price.findByIdAndUpdate(
            req.params.id,
            { commodityId, warehouseId, unit, $push: { historicalPrices: { price } } }
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

const getPriceByWarehouseIdAndCommodityId = async (req, res, next) => {
    const { warehouseId, commodityId } = req.params;
    try {
        const priceData = await Price.findOne({ warehouseId, commodityId });

        if (!priceData || priceData.historicalPrices.length === 0) {
            return res.status(404).json({ status: false, message: 'Price data not found' });
        }

        const latestPrice = priceData.historicalPrices.sort((a, b) => b.date - a.date)[0];

        res.status(200).json({
            status: true,
            message: "Latest price fetched successfully !!",
            data: {
                commodityId: priceData.commodityId,
                warehouseId: priceData.warehouseId,
                unit: priceData.unit,
                latestPrice: latestPrice.price,
                date: latestPrice.date
            }
        });
    } catch (error) {
        console.error('Error fetching price data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { createPrice, getAllPrices, getPriceById, getPriceByWarehouseCommodity, updatePriceById, deletePriceById, getPriceByWarehouseIdAndCommodityId };
