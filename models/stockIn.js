const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
    totalQuantity: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockIn', stockInSchema);
