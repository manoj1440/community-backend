const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historicalPriceSchema = new Schema({
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    financialYear: {
        type: String
    }
});

const priceSchema = new Schema({
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
    unit: {
        type: String,
        enum: ['Kgs', 'Tons', 'Quintals'],
        required: true
    },
    historicalPrices: [historicalPriceSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Price', priceSchema);
