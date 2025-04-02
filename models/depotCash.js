const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityType'
    },
    entityType: {
        type: String,
        enum: ['User', 'Farmer', 'Customer']
    },
    consignmentId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
    },
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
    },
    reverted: {
        type: Boolean,
        default: false
    },
    originalTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    financialYear: {
        type: String,  // Add financial year field here
    }
});

// DepotCash Schema
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
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    date: {
        type: Date,
        default: Date.now
    },
    financialYear: {  // Add financial year field here
        type: String,
    }
});

const DepotCash = mongoose.model('DepotCash', depotCashSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { DepotCash, Transaction };