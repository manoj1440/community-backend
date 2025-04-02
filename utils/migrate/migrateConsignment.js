require('dotenv').config();
const mongoose = require('mongoose');
const Consignment = require('../../models/consignment');

const MONGO_URI = process.env.MONGO_URI;
console.log("🚀 ~ MONGO_URI:", MONGO_URI)

const migrateConsignment = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB...');

        const consignments = await Consignment.find({});
        console.log(`Found ${consignments.length} Consignment documents to migrate`);

        for (const consignmentDoc of consignments) {
            consignmentDoc.financialYear = '2024-2025';
            await consignmentDoc.save();
            console.log(`Updated Consignment document ${consignmentDoc._id}`);
        }

        console.log('Consignment migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('Consignment migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

migrateConsignment();
