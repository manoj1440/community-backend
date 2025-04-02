require('dotenv').config(); // Load environment variables

console.log("🚀 ~ process.env.MONGO_URI:", process.env.MONGO_URI); // Debugging line

const mongoose = require('mongoose');
const archiveAllCollections = require('./archiveAllCollections');

const MONGO_URI = process.env.MONGO_URI; // Get MongoDB URL from .env

const startArchiving = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env file!");
        }

        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
        
        await archiveAllCollections();

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

startArchiving();
