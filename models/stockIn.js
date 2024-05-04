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

const stockInSchema = new Schema({
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
    bags: [bagSchema],
    totalQuantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockIn', stockInSchema);
