const Transporter = require('../models/transporter');

const createTransporter = async (req, res, next) => {
    try {
        const { driverName, vehicleNumber, driverContactNo } = req.body;
        const transporter = new Transporter({ driverName, vehicleNumber, driverContactNo });
        await transporter.save();
        res.status(201).json({ status: true, message: 'Transporter created successfully', data: transporter });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create transporter', error: error.message });
    }
};

const getAllTransporters = async (req, res, next) => {
    try {
        const transporters = await Transporter.find();
        res.json({ status: true, message: 'Transporters fetched successfully', data: transporters });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch transporters', error: error.message });
    }
};

const getTransporterById = async (req, res, next) => {
    try {
        const transporter = await Transporter.findById(req.params.id);
        if (!transporter) {
            return res.status(404).json({ status: false, message: 'Transporter not found' });
        }
        res.json({ status: true, message: 'Transporter fetched successfully', data: transporter });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch transporter', error: error.message });
    }
};

const updateTransporterById = async (req, res, next) => {
    try {
        const { driverName, vehicleNumber, driverContactNo } = req.body;
        const updatedTransporter = await Transporter.findByIdAndUpdate(req.params.id, { driverName, vehicleNumber, driverContactNo }, { new: true });
        if (!updatedTransporter) {
            return res.status(404).json({ status: false, message: 'Transporter not found' });
        }
        res.json({ status: true, message: 'Transporter updated successfully', data: updatedTransporter });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update transporter', error: error.message });
    }
};

const deleteTransporterById = async (req, res, next) => {
    try {
        const deletedTransporter = await Transporter.findByIdAndDelete(req.params.id);
        if (!deletedTransporter) {
            return res.status(404).json({ status: false, message: 'Transporter not found' });
        }
        res.json({ status: true, message: 'Transporter deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete transporter', error: error.message });
    }
};

const getTransportersForWebsite = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const skip = (page - 1) * pageSize;
    
    const paginate = req.query.page && req.query.pageSize;

    let transportersQuery = Transporter.find().select('-__v');

    if (paginate) {
      transportersQuery = transportersQuery.skip(skip).limit(pageSize);
    }

    const transporters = await transportersQuery;
    const totalTransporters = await Transporter.countDocuments();

    res.json({
      status: true,
      message: 'Transporters fetched successfully for website',
      data: transporters,
      pagination: paginate
        ? {
            page,
            pageSize,
            total: totalTransporters,
            totalPages: Math.ceil(totalTransporters / pageSize),
          }
        : null, 
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Failed to fetch transporters for website',
      error: error.message,
    });
  }
};


module.exports = { createTransporter, getAllTransporters, getTransporterById, updateTransporterById, deleteTransporterById, getTransportersForWebsite };
