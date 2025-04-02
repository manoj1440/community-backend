const mongoose = require('mongoose');

const EXCLUDED_COLLECTIONS = ['commodities', 'customers', 'Transporter', 'users', 'warehouses']

const archiveAllCollections = async () => {
    const db = mongoose.connection.db;
    const archiveSuffix = getFinancialYearSuffix();

    try {
        console.log('Fetching all collections...');
        const collections = await db.listCollections().toArray();
        console.log(`Found ${collections.length} collections.`);

        for (const collection of collections) {
            const collectionName = collection.name.toLowerCase();

            if (EXCLUDED_COLLECTIONS.includes(collectionName)) {
                console.log(`Skipping collection: ${collectionName}`);
                continue;
            }

            const archiveCollectionName = `${collectionName}${archiveSuffix}`;

            console.log(`Archiving collection: ${collectionName} to ${archiveCollectionName}...`);

            await db.collection(collection.name).aggregate([
                { $match: {} },
                { $out: archiveCollectionName }
            ]).toArray();

            console.log(`Archived collection: ${collectionName} to ${archiveCollectionName}`);

            await db.collection(collection.name).deleteMany({});
            console.log(`Cleared collection: ${collectionName}`);
        }

        console.log('All collections archived and reset successfully.');
    } catch (error) {
        console.error('Error archiving collections:', error);
    }
};

const getFinancialYearSuffix = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month >= 4) {
        return `_FY${year}-${year + 1}`;
    } else {
        return `_FY${year - 1}-${year}`;
    }
};

module.exports = archiveAllCollections;
