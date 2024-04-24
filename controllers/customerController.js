const Customer = require('../models/customer');

const createCustomer = async (req, res, next) => {
    try {
        const { name, address, contactDetail, transactionRef } = req.body;
        const customer = new Customer({ name, address, contactDetail, transactionRef });
        await customer.save();
        res.status(201).json({ status: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create customer', error: error.message });
    }
};

const getAllCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find();
        res.json({ status: true, message: 'Customers fetched successfully', data: customers });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch customers', error: error.message });
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.json({ status: true, message: 'Customer fetched successfully', data: customer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch customer', error: error.message });
    }
};

const updateCustomerById = async (req, res, next) => {
    try {
        const { name, address, contactDetail, transactionRef } = req.body;
        const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, { name, address, contactDetail, transactionRef }, { new: true });
        if (!updatedCustomer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.json({ status: true, message: 'Customer updated successfully', data: updatedCustomer });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update customer', error: error.message });
    }
};

const deleteCustomerById = async (req, res, next) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
        if (!deletedCustomer) {
            return res.status(404).json({ status: false, message: 'Customer not found' });
        }
        res.json({ status: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete customer', error: error.message });
    }
};

module.exports = { createCustomer, getAllCustomers, getCustomerById, updateCustomerById, deleteCustomerById };
