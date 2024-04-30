const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const consignmentSchema = new Schema({
    consignmentId: {
        type: String,
        default: function () {
            const randomString = uuidv4().substring(0, 6);
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            return `GOAL${date}${randomString.toUpperCase()}`;
        },
        unique: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transporter',
        required: true
    },
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
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    existingUnit: {
        type: String,
        required: true
    },
    transfered: {
        type: String,
        default: 'No'
    },
    transferedAt: {
        type: Date
    },
    rate: {
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

module.exports = mongoose.model('Consignment', consignmentSchema);
