require('dotenv').config();
const mongoose = require('mongoose');
const Price = require('../../models/price');
const getFinancialYear = require('../../utils/financialYear');

const MONGO_URI = process.env.MONGO_URI

const migratePrices = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB...');

        const prices = await Price.find({});
        console.log(`Found ${prices.length} Price documents to migrate`);

        for (const priceDoc of prices) {
            let needsUpdate = false;

            const updatedHistoricalPrices = priceDoc.historicalPrices.map(entry => {
                if (!entry.financialYear) {
                    needsUpdate = true;
                    return {
                        ...entry.toObject(),
                        financialYear: getFinancialYear(entry.date),
                    };
                }
                return entry;
            });

            if (needsUpdate) {
                priceDoc.historicalPrices = updatedHistoricalPrices;
                await priceDoc.save();
                console.log(`Updated Price document ${priceDoc._id}`);
            }
        }

        console.log('Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

migratePrices();