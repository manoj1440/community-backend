const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
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
    amount: {
        type: Number,
        required: true
    }
});

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
    transferred: {
        type: String,
        default: 'No'
    },
    transferredAt: {
        type: Date
    },
    commodity: [commoditySchema],
    totalAmount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consignment', consignmentSchema);
