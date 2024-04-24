const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commoditySchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Commodity', commoditySchema);
