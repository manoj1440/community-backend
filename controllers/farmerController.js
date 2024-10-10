const Farmer = require('../models/farmer');

const createFarmer = async (req, res, next) => {
    try {
        const { name, contactNo, address } = req.body;
        const farmer = new Farmer({ name, contactNo, address });
        await farmer.save();
        res.status(201).json({ status: true, message: 'Farmer created successfully', data: farmer });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create farmer', error: error.message });
    }
};

const getAllFarmers = async (req, res, next) => {
    try {
        const farmers = await Farmer.find();
        res.json({ status: true, message: 'Farmers fetched successfully', data: farmers });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch farmers', error: error.message });
    }
};

const getFarmerById = async (req, res, next) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) {
            return res.status(404).json({ status: false, message: 'Farmer not found' });
        }
        res.json({ status: true, message: 'Farmer fetched successfully', data: farmer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch farmer', error: error.message });
    }
};

const updateFarmerById = async (req, res, next) => {
    try {
        const { name, contactNo, address } = req.body;
        const updatedFarmer = await Farmer.findByIdAndUpdate(req.params.id, { name, contactNo, address }, { new: true });
        if (!updatedFarmer) {
            return res.status(404).json({ status: false, message: 'Farmer not found' });
        }
        res.json({ status: true, message: 'Farmer updated successfully', data: updatedFarmer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update farmer', error: error.message });
    }
};

const deleteFarmerById = async (req, res, next) => {
    try {
        const deletedFarmer = await Farmer.findByIdAndDelete(req.params.id);
        if (!deletedFarmer) {
            return res.status(404).json({ status: false, message: 'Farmer not found' });
        }
        res.json({ status: true, message: 'Farmer deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete farmer', error: error.message });
    }
};

const getFarmersForWebsite = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page); 
        const pageSize = parseInt(req.query.pageSize); 

        let farmersQuery = Farmer.find().select('-__v'); 

        if (page && pageSize) {
            const skip = (page - 1) * pageSize;
            farmersQuery = farmersQuery.skip(skip).limit(pageSize); 
        }

        const farmers = await farmersQuery;

        const totalFarmers = await Farmer.countDocuments();

        res.json({
            status: true,
            message: 'Farmers fetched successfully for website',
            data: {
                farmers,
                page: page || null, 
                pageSize: pageSize || null,
                total: totalFarmers,
                totalPages: pageSize ? Math.ceil(totalFarmers / pageSize) : null, 
            }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch farmers for website', error: error.message });
    }
}

module.exports = { createFarmer, getAllFarmers, getFarmerById, updateFarmerById, deleteFarmerById, getFarmersForWebsite };
