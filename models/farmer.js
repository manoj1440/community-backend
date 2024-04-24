const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const farmerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);
