const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transporterSchema = new Schema({
    driverName: {
        type: String,
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    driverContactNo : {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transporter', transporterSchema);
