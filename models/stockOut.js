const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockOutSchema = new Schema({
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    commodityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commodity',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    quantity: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    received: {
        type: String,
        default: 'No'
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockOut', stockOutSchema);
