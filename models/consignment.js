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
    amount: {
        type: Number,
        required: true
    }
});

const consignmentSchema = new Schema({
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
    commodity: [commoditySchema],
    totalAmount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Consignment', consignmentSchema);
