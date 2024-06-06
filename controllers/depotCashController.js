const DepotCash = require('../models/depotCash');
const Warehouse = require('../models/warehouse');
const Farmer = require('../models/farmer');
const Customer = require('../models/customer');
const User = require('../models/User');
const mongoose = require('mongoose')

exports.addDepotCash = async (req, res) => {
    const { warehouseId, amount } = req.body;
    const userId = req.userData.user._id;
    const amount1 = parseInt(amount)

    try {
        let existingDepotCashEntry = await DepotCash.findOne({ warehouseId });


        if (existingDepotCashEntry) {
            let openingAmount = existingDepotCashEntry.closingAmount;
            let closingAmount = existingDepotCashEntry.closingAmount + amount1;

            openingAmount += amount1;
            // closingAmount += amount1;

            existingDepotCashEntry.transactions.push({
                entityId : userId, 
                entityType: 'User',
                date: new Date(),
                amount: amount1,
                type: 'Credit'
            });

            existingDepotCashEntry.openingAmount = openingAmount;
            existingDepotCashEntry.closingAmount = closingAmount;
            existingDepotCashEntry.date = new Date();
            await existingDepotCashEntry.save();

        } else {
            const newDepotCashEntry = new DepotCash({
                warehouseId: warehouseId,
                openingAmount: amount1,
                closingAmount: amount1,
                date: new Date(),
            });
            await newDepotCashEntry.save();
        }

        res.status(200).json({ message: 'Depot cash entry added successfully' });
    } catch (error) {
        console.error('Error adding depot cash:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllDepotCashEntries = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        const depotCashEntries = [];

        for (const warehouse of warehouses) {
            let depotCashEntry = await DepotCash.aggregate([
                { 
                    $match: { warehouseId: warehouse._id }
                },
                {
                 $lookup: {
                        from: "warehouses",
                        localField: "warehouseId",
                        foreignField: "_id",
                        as: "warehouses"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "transactions.entityId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "farmers",
                        localField: "transactions.entityId",
                        foreignField: "_id",
                        as: "farmer"
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "transactions.entityId",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                {
                    $addFields: {
                        transactions: {
                            $map: {
                                input: "$transactions",
                                as: "transaction",
                                in: {
                                    $mergeObjects: [
                                        "$$transaction",
                                        {
                                            entity: {
                                                $cond: [
                                                    { $eq: ["$$transaction.entityType", "User"] },
                                                    { $arrayElemAt: ["$user", 0] },
                                                    { $cond: [
                                                        { $eq: ["$$transaction.entityType", "Farmer"] },
                                                        { $arrayElemAt: ["$farmer", 0] },
                                                        { $arrayElemAt: ["$customer", 0] }
                                                    ]}
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);

            if (!depotCashEntry || depotCashEntry.length === 0) {
                const newDepotCashEntry = new DepotCash({
                    warehouseId: warehouse._id,
                    openingAmount: 0,
                    closingAmount: 0,
                    date: new Date()
                });
                await newDepotCashEntry.save();
                depotCashEntries.push(newDepotCashEntry);
            } else {
                depotCashEntries.push(depotCashEntry[0]);
            }
        }

        res.json(depotCashEntries);
    } catch (error) {
        console.error('Error fetching depot cash entries:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





exports.getDepotCashById = async (req, res) => {
    const { id } = req.params;
    try {
        const depotCashEntry = await DepotCash.findById(id);
        if (!depotCashEntry) {
            return res.status(404).json({ error: 'Depot cash entry not found' });
        }
        res.json(depotCashEntry);
    } catch (error) {
        console.error('Error fetching depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateDepotCashById = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
        // const depotCashEntry = await DepotCash.findByIdAndUpdate(id, { amount }, { new: true });
        // if (!depotCashEntry) {
        //     return res.status(404).json({ error: 'Depot cash entry not found' });
        // }
        // res.json({ message: 'Depot cash entry updated successfully', depotCashEntry });
    } catch (error) {
        console.error('Error updating depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteDepotCashById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedDepotCashEntry = await DepotCash.findByIdAndDelete(id);
        if (!deletedDepotCashEntry) {
            return res.status(404).json({ error: 'Depot cash entry not found' });
        }
        res.json({ message: 'Depot cash entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting depot cash entry by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
