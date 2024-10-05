const Price = require('../models/price');
const Commodity = require('../models/commodity');
const Warehouse = require('../models/warehouse');
const Farmer = require('../models/farmer');
const Transporter = require('../models/transporter');
const Consignment = require('../models/consignment');
const StockIn = require('../models/stockIn');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const User = require('../models/User');

exports.mergePrice = async (req, res) => {
    try {

        const oldDbPath = path.join(__dirname, '../oldDb.json');
        const oldData = JSON.parse(fs.readFileSync(oldDbPath, 'utf-8'));

        const newPrices = await Price.find().lean();

        const commodityMap = await Commodity.find().lean().then(commodities =>
            commodities.reduce((map, commodity) => {
                map[commodity.name] = commodity._id;
                return map;
            }, {})
        );

        const warehouseMap = await Warehouse.find().lean().then(warehouses =>
            warehouses.reduce((map, warehouse) => {
                map[warehouse.name] = warehouse._id;
                return map;
            }, {})
        );

        const updates = [];
        const inserts = [];

        oldData.forEach(oldRecord => {
            const { commodityName, warehouseName, historicalPrices } = oldRecord;

            const commodityId = commodityMap[commodityName];
            const warehouseId = warehouseMap[warehouseName];

            if (commodityId && warehouseId) {
                const newPriceRecord = newPrices.find(price =>
                    price.commodityId.toString() === commodityId.toString() &&
                    price.warehouseId.toString() === warehouseId.toString()
                );

                if (newPriceRecord) {

                    updates.push({
                        updateOne: {
                            filter: { _id: newPriceRecord._id },
                            update: { $addToSet: { historicalPrices: { $each: historicalPrices } } }
                        }
                    });
                } else {

                    inserts.push({
                        commodityId,
                        warehouseId,
                        unit: oldRecord.unit,
                        historicalPrices
                    });
                }
            }
        });

        if (updates.length > 0) {
            await Price.bulkWrite(updates);
        }

        if (inserts.length > 0) {
            await Price.insertMany(inserts);
        }

        res.status(200).json({ message: 'Price data merged successfully!' });
    } catch (error) {
        console.error('Error merging price data:', error);
        res.status(500).json({ message: 'Error merging price data.', error: error.message });
    }
};

exports.mergeFarmer = async (req, res) => {
    try {

        const newFarmers = await Farmer.find().lean();


        const oldDbPath = path.join(__dirname, '../path/to/your/oldFarmers.json');
        const oldFarmersData = JSON.parse(fs.readFileSync(oldDbPath, 'utf-8'));


        const existingFarmerNames = new Set(newFarmers.map(farmer => farmer.name.trim().toLowerCase()));

        const farmersToInsert = [];

        oldFarmersData.forEach(oldFarmer => {
            const { name, contactNo, address } = oldFarmer;
            const trimmedName = name.trim().toLowerCase();

            if (!existingFarmerNames.has(trimmedName)) {
                farmersToInsert.push({
                    name,
                    contactNo,
                    address
                });
            }
        });

        if (farmersToInsert.length > 0) {
            await Farmer.insertMany(farmersToInsert);
        }

        res.status(200).json({ message: 'Farmer data merged successfully!', insertedCount: farmersToInsert.length });
    } catch (error) {
        console.error('Error merging farmer data:', error);
        res.status(500).json({ message: 'Error merging farmer data.', error: error.message });
    }
};

exports.mergeTransporter = async (req, res) => {
    try {
        const newTransporters = await Transporter.find().lean();

        const oldDbPath = path.join(__dirname, '../path/to/your/oldTransporters.json');
        const oldTransportersData = JSON.parse(fs.readFileSync(oldDbPath, 'utf-8'));

        const existingTransporterNames = new Set(newTransporters.map(transporter => transporter.driverName.trim().toLowerCase()));

        const transportersToInsert = [];

        oldTransportersData.forEach(oldTransporter => {
            const { driverName, vehicleNumber, driverContactNo } = oldTransporter;
            const trimmedName = driverName.trim().toLowerCase();

            if (!existingTransporterNames.has(trimmedName)) {
                transportersToInsert.push({
                    driverName,
                    vehicleNumber,
                    driverContactNo
                });
            }
        });

        if (transportersToInsert.length > 0) {
            await Transporter.insertMany(transportersToInsert);
        }

        res.status(200).json({ message: 'Transporter data merged successfully!', insertedCount: transportersToInsert.length });
    } catch (error) {
        console.error('Error merging transporter data:', error);
        res.status(500).json({ message: 'Error merging transporter data.', error: error.message });
    }
};

exports.mergeConsignments = async (req, res) => {
    try {
        const oldConsignments = req.body;


        for (const oldConsignment of oldConsignments) {
            const { consignmentId, farmerId, transporterId, warehouseId, commodity, totalAmount } = oldConsignment;

            const existingConsignment = await Consignment.findOne({ consignmentId });

            if (existingConsignment) {
                console.log(`Consignment ${consignmentId} already exists in the new database.`);
                continue;
            }

            for (const item of commodity) {
                const { commodityId, totalQuantity } = item;
                await updateStockIn(warehouseId.$oid, commodityId.$oid, totalQuantity);
            }

            const newConsignment = new Consignment({
                farmerId: farmerId.$oid,
                transporterId: transporterId.$oid,
                warehouseId: warehouseId.$oid,
                commodity,
                totalAmount,
                consignmentId: consignmentId,
                createdAt: oldConsignment.createdAt.$date,
                updatedAt: oldConsignment.updatedAt.$date,
                transferred: oldConsignment.transferred,
                transferredAt: oldConsignment.transferredAt ? oldConsignment.transferredAt.$date : null
            });

            await newConsignment.save();
            console.log(`Consignment ${consignmentId} merged successfully.`);
        }

        res.status(201).json({ status: true, message: 'Consignments merged successfully' });
    } catch (error) {
        console.error('Failed to merge consignments:', error);
        res.status(500).json({ status: false, message: 'Failed to merge consignments', error: error.message });
    }
}

const updateStockIn = async (warehouseId, commodityId, totalQuantity) => {
    try {
        let stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (!stockIn) {
            stockIn = new StockIn({ warehouseId, commodityId, totalQuantity });
        } else {
            stockIn.totalQuantity += totalQuantity;

            if (stockIn.totalQuantity <= 0) {
                stockIn.totalQuantity = 0;
            }
        }
        await stockIn.save();
    } catch (error) {
        throw new Error('Failed to update stock-in: ' + error.message);
    }
};

const normalizeName = (name) => {
    return name.trim().toLowerCase();
};

const oldWarehouseMapping = {
    'kapiri depo': '662c34fc921f9a7a7978ecf0',
    'kapiri shop': '662c9f5c921f9a7a7978f3da',
    'mpongwe depo': '6631911ff71cb6ac54c1d1e9',
    'kabwe depo': '66291d41530a4dadd76dd8fc',
};

exports.mergeNewConsignment = async (req, res) => {
    try {
        const file = req.file;
        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        const transporterCache = {};
        const farmerCache = {};
        const createdByCache = {};

        for (const row of rows) {

            const farmerName = normalizeName(row['Farmer Name']);
            const transporterName = normalizeName(row['Transporter Name']);
            const commodityNameNormalized = normalizeName(row['Item']);
            const createdByName = normalizeName(row['CreatedBy']);

            let farmer = farmerCache[farmerName];
            if (!farmer) {
                farmer = await Farmer.findOne({ name: { $regex: new RegExp(`^${farmerName}$`, 'i') } });
                if (!farmer) {
                    farmer = new Farmer({
                        name: row['Farmer Name'],
                        contactNo: row['Farmer ContactNo'] || 'N/A',
                        address: row['Farmer Address'] || 'N/A'
                    });
                    await farmer.save();
                }
                farmerCache[farmerName] = farmer;
            }

            let transporter = transporterCache[transporterName];
            if (!transporter) {
                transporter = await Transporter.findOne({ name: { $regex: new RegExp(`^${transporterName}$`, 'i') } });
                if (!transporter) {
                    transporter = new Transporter({
                        driverName: row['Transporter Name'],
                        vehicleNumber: row['Transporter No']
                    });
                    await transporter.save();
                }
                transporterCache[transporterName] = transporter;
            }

            let createdBy = createdByCache[createdByName];
            if (!createdBy) {
                createdBy = await User.findOne({ name: { $regex: new RegExp(`^${createdByName}$`, 'i') } });

                createdByCache[createdByName] = createdBy;
            }

            const warehouseNameNormalized = normalizeName(row['Warehouse Name']);
            let warehouseId;
            if (oldWarehouseMapping[warehouseNameNormalized]) {
                warehouseId = oldWarehouseMapping[warehouseNameNormalized];
            }

            const commodity = await Commodity.findOne({ name: { $regex: new RegExp(`^${commodityNameNormalized}$`, 'i') } });
            if (!commodity) {
                return res.status(400).json({ status: false, message: `Commodity ${row.commodityName} not found` });
            }

            const commoditiesData = {
                commodityId: commodity._id,
                bags: [{
                    noOfBags: Number(row['No of Bags']) || 0,
                    weight: Number(row['Avg Weight']) || 0,
                    quantity: Number(row['Total Weight']) || 0,
                }],
                totalQuantity: Number(row['Total Weight']) || 0,
                amount: Number(row['Price Paid to Farmer']) || 0,
            };

            await updateStockIn(warehouseId, commoditiesData.commodityId, commoditiesData.totalQuantity)

            const consignmentDate = row['Date'] ? new Date(row['Date']) : new Date();

            const newConsignment = new Consignment({
                consignmentId: row['consignmentId'] || undefined,
                farmerId: farmer._id,
                transporterId: transporter._id,
                warehouseId: warehouseId,
                commodity: [commoditiesData],
                totalAmount: Number(row['Price Paid to Farmer']) || 0,
                createdBy: createdBy._id,
                createdAt: consignmentDate,
            });

            await newConsignment.save();
        }

        res.status(201).json({ status: true, message: 'Consignments processed successfully' });
    } catch (error) {
        console.log("🚀 ~ exports.mergeNewConsignment= ~ error:", error)
        res.status(500).json({ status: false, message: 'Failed to process consignments', error: error });
    }
}