const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bagSchema = new Schema({
    noOfBags: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const StockOutSchema = new Schema({
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    commodityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commodity',
        required: true
    },
    bags: [bagSchema],
    totalQuantity: {
        type: Number,
        required: true
    },
    totalReceivedQuantity: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        required: true
    },
    received: {
        type: String,
        default: 'No'
    },
    receivedAt: {
        type: Date
    },
    amount: {
        type: Number,
        required: true
    },
    receivedAmount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('StockOut', StockOutSchema);

