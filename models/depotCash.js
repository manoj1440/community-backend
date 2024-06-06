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


depotCashSchema.virtual('transactions.entity', {
    ref: function(model) {
        switch (model.entityType) {
            case 'User':
                return 'User';
            case 'Farmer':
                return 'Farmer';
            case 'Customer':
                return 'Customer';
            default:
                return 'User';
        }
    },
    localField: 'transactions.entityId',
    foreignField: '_id',
    justOne: true,
});

module.exports = mongoose.model('DepotCash', depotCashSchema);
