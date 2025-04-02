require('dotenv').config();
const mongoose = require('mongoose');
const { DepotCash, Transaction } = require('../../models/depotCash');
const getFinancialYear = require('../../utils/financialYear'); // Ensure you have this function

const MONGO_URI = process.env.MONGO_URI;

const migrateDepotCash = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB...');

        const depotCashEntries = await DepotCash.find({});
        console.log(`Found ${depotCashEntries.length} DepotCash documents to migrate`);

        for (const depotCash of depotCashEntries) {
                depotCash.financialYear = "2024-2025";
                await depotCash.save();
                console.log(`Updated DepotCash document ${depotCash._id}`);
        }

        const transactions = await Transaction.find({});
        console.log(`Found ${transactions.length} Transaction documents to migrate`);

        for (const transaction of transactions) {
                transaction.financialYear = "2024-2025";
                await transaction.save();
                console.log(`Updated Transaction document ${transaction._id}`);
        }

        console.log('DepotCash migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('DepotCash migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

migrateDepotCash();
