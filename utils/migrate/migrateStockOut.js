require('dotenv').config();
const mongoose = require('mongoose');
const StockOut = require('../../models/stockOut');
const getFinancialYear = require('../../utils/financialYear');

const MONGO_URI = process.env.MONGO_URI;

const migrateStockOut = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB...');

        const stockOuts = await StockOut.find({});
        console.log(`Found ${stockOuts.length} StockOut documents to migrate`);

        for (const stockDoc of stockOuts) {
            stockDoc.financialYear = '2024-2025';
            await stockDoc.save();
            console.log(`Updated StockOut document ${stockDoc._id}`);
        }

        console.log('StockOut migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('StockOut migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

migrateStockOut();
