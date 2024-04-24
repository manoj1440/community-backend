const Warehouse = require('../models/warehouse');

const createWarehouse = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        const warehouse = new Warehouse({ name, address });
        await warehouse.save();
        res.status(201).json({ status: true, message: 'Warehouse created successfully', data: warehouse });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create warehouse', error: error.message });
    }
};

const getAllWarehouses = async (req, res, next) => {
    try {
        const warehouses = await Warehouse.find();
        res.json({ status: true, message: 'Warehouses fetched successfully', data: warehouses });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch warehouses', error: error.message });
    }
};

const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        if (!warehouse) {
            return res.status(404).json({ status: false, message: 'Warehouse not found' });
        }
        res.json({ status: true, message: 'Warehouse fetched successfully', data: warehouse });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch warehouse', error: error.message });
    }
};

const updateWarehouseById = async (req, res, next) => {
    try {
        const { name, address } = req.body;
        const updatedWarehouse = await Warehouse.findByIdAndUpdate(req.params.id, { name, address }, { new: true });
        if (!updatedWarehouse) {
            return res.status(404).json({ status: false, message: 'Warehouse not found' });
        }
        res.json({ status: true, message: 'Warehouse updated successfully', data: updatedWarehouse });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update warehouse', error: error.message });
    }
};

const deleteWarehouseById = async (req, res, next) => {
    try {
        const deletedWarehouse = await Warehouse.findByIdAndDelete(req.params.id);
        if (!deletedWarehouse) {
            return res.status(404).json({ status: false, message: 'Warehouse not found' });
        }
        res.json({ status: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete warehouse', error: error.message });
    }
};

module.exports = { createWarehouse, getAllWarehouses, getWarehouseById, updateWarehouseById, deleteWarehouseById };
