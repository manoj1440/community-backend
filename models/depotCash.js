const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['Credit', 'Debit'],
        required: true
    }
});

const depotCashSchema = new mongoose.Schema({
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    openingAmount: {
        type: Number,
        required: true
    },
    closingAmount: {
        type: Number,
        required: true
    },
    transactions: [transactionSchema],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DepotCash', depotCashSchema);
