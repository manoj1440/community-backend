const Commodity = require('../models/commodity');

const createCommodity = async (req, res, next) => {
    try {
        const { name } = req.body;
        const commodity = new Commodity({ name });
        await commodity.save();
        res.status(201).json({ status: true, message: 'Commodity created successfully', data: commodity });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create commodity', error: error.message });
    }
};

const getAllCommodities = async (req, res, next) => {
    try {
        const commodities = await Commodity.find();
        res.json({ status: true, message: 'Commodities fetched successfully', data: commodities });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch commodities', error: error.message });
    }
};

const getCommodityById = async (req, res, next) => {
    try {
        const commodity = await Commodity.findById(req.params.id);
        if (!commodity) {
            return res.status(404).json({ status: false, message: 'Commodity not found' });
        }
        res.json({ status: true, message: 'Commodity fetched successfully', data: commodity });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch commodity', error: error.message });
    }
};

const updateCommodityById = async (req, res, next) => {
    try {
        const { name } = req.body;
        const updatedCommodity = await Commodity.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!updatedCommodity) {
            return res.status(404).json({ status: false, message: 'Commodity not found' });
        }
        res.json({ status: true, message: 'Commodity updated successfully', data: updatedCommodity });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update commodity', error: error.message });
    }
};

const deleteCommodityById = async (req, res, next) => {
    try {
        const deletedCommodity = await Commodity.findByIdAndDelete(req.params.id);
        if (!deletedCommodity) {
            return res.status(404).json({ status: false, message: 'Commodity not found' });
        }
        res.json({ status: true, message: 'Commodity deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete commodity', error: error.message });
    }
};

module.exports = { createCommodity, getAllCommodities, getCommodityById, updateCommodityById, deleteCommodityById };
