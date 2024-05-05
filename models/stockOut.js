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

const commoditySchema = new Schema({
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
    rate: {
        type: Number,
        required: true
    },
    amount: {
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
    received: {
        type: String,
        default: 'No'
    },
    receivedAt: {
        type: Date
    },
    commodity: [commoditySchema],
    totalAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockOut', StockOutSchema);

