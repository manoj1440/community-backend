const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockInSchema = new Schema({
    commodityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commodity',
        required: true
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockIn', stockInSchema);
