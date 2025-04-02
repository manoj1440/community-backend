require('dotenv').config();
const mongoose = require('mongoose');
const StockIn = require('../../models/stockIn');
const getFinancialYear = require('../../utils/financialYear');

const MONGO_URI = process.env.MONGO_URI;

const migrateStockIn = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB...');

        const stockIns = await StockIn.find({});
        console.log(`Found ${stockIns.length} StockIn documents to migrate`);

        for (const stockDoc of stockIns) {
            stockDoc.financialYear = '2024-2025';;
            await stockDoc.save();
            console.log(`Updated StockIn document ${stockDoc._id}`);
        }

        console.log('StockIn migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('StockIn migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

migrateStockIn();
