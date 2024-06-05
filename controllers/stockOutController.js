const StockOut = require('../models/stockOut');
const StockIn = require('../models/stockIn');
const DepotCash = require('../models/depotCash');

const updateStockIn = async (warehouseId, commodityId, totalQuantity) => {
    try {
        let stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (!stockIn) {
            stockIn = new StockIn({ warehouseId, commodityId, totalQuantity });
        } else {
            stockIn.totalQuantity += totalQuantity;

            if (stockIn.totalQuantity <= 0) {
                stockIn.totalQuantity = 0;
            }
        }

        await stockIn.save();
    } catch (error) {
        throw new Error('Failed to update stock-in: ' + error.message);
    }
};

// Create a new StockOut
const createStockOut = async (req, res) => {
    try {
        await updateStockIn(req.body.warehouseId, req.body.commodityId, -req.body.totalQuantity);

        const newStockOut = await StockOut.create(req.body);

        res.status(201).json({
            status: true,
            message: 'StockOut created successfully',
            data: newStockOut,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'Failed to create StockOut',
            error: error.message,
        });
    }
};

// Get all StockOuts
const getAllStockOuts = async (req, res) => {
    try {
        const warehouseId = req.userData.user.warehouseId._id;
        const role = req.userData.user.role;
        if (role === 'ADMIN') {
            const stockOuts = await StockOut.find().populate('warehouseId customerId commodityId').sort({ createdAt: -1 });
            res.json({
                status: true,
                message: 'StockOuts fetched successfully',
                data: stockOuts,
            });
        } else {
            const stockOuts = await StockOut.find({ warehouseId: warehouseId }).populate('warehouseId customerId commodityId').sort({ createdAt: -1 });
            res.json({
                status: true,
                message: 'StockOuts fetched successfully',
                data: stockOuts,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to fetch StockOuts',
            error: error.message,
        });
    }
};

// Get a single StockOut by ID
const getStockOutById = async (req, res) => {
    try {
        const stockOut = await StockOut.findById(req.params.id).populate('warehouseId customerId commodityId');
        if (!stockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }
        res.json({
            status: true,
            message: 'StockOut fetched successfully',
            data: stockOut,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to fetch StockOut',
            error: error.message,
        });
    }
};

const updateStockOut = async (req, res) => {
    try {
        const { received, totalQuantity, rate, amount, totalReceivedQuantity, receivedAmount } = req.body;

        let receivedAt;

        // Check if 'received' field is present in the request body
        if (received !== undefined) {
            receivedAt = received.toLowerCase() === 'yes' ? new Date().toISOString() : null;
        }

        const updateData = received !== undefined ? { received, receivedAt } : {
            totalQuantity,
            rate,
            amount,
            totalReceivedQuantity,
            receivedAmount
        };

        // Update the StockOut document
        const updatedStockOut = await StockOut.findByIdAndUpdate(req.params.id, updateData, { new: true });

        // Handle case where StockOut document is not found
        if (!updatedStockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }

        // Perform additional actions if 'received' is 'Yes'
        if (received === 'Yes') {
            const warehouseId = updatedStockOut.warehouseId;
            const depotCash = await DepotCash.findOne({ warehouseId });

            if (depotCash) {
                depotCash.transactions.push({
                    date: new Date(),
                    amount: updatedStockOut.receivedAmount,
                    type: 'Credit'
                });
                await depotCash.save();
            } else {
                console.log('DepotCash not found for warehouseId:', warehouseId);
            }
        }

        // Send response with updated StockOut data
        res.json({
            status: true,
            message: 'StockOut updated successfully',
            data: updatedStockOut,
        });
    } catch (error) {
        console.error('Error updating StockOut:', error);
        res.status(400).json({
            status: false,
            message: 'Failed to update StockOut',
            error: error.message,
        });
    }
};


// Delete a StockOut by ID
const deleteStockOut = async (req, res) => {
    try {
        const deletedStockOut = await StockOut.findByIdAndDelete(req.params.id);
        if (!deletedStockOut) {
            return res.status(404).json({
                status: false,
                message: 'StockOut not found',
            });
        }
        await updateStockIn(deletedStockOut.warehouseId, deletedStockOut.commodityId, deletedStockOut.totalQuantity);

        res.json({
            status: true,
            message: 'StockOut deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to delete StockOut',
            error: error.message,
        });
    }
};

module.exports = {
    createStockOut,
    getAllStockOuts,
    getStockOutById,
    updateStockOut,
    deleteStockOut,
};