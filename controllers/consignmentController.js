const Consignment = require('../models/consignment');
const StockIn = require('../models/stockIn');

const saveStockIn = async (warehouseId, commodityId, quantity) => {
    try {
        const stockIn = await StockIn.findOne({ warehouseId, commodityId });

        console.log('stockIn==', stockIn);
        console.log('warehouseId, commodityId==', warehouseId, commodityId);

        if (!stockIn) {
            const newStockIn = new StockIn({ warehouseId, commodityId, quantity });
            await newStockIn.save();
        } else {
            stockIn.quantity += quantity;
            await stockIn.save();
        }

    } catch (error) {
        console.log('message: ', 'Failed to update quantity', 'error:', error.message);
    }
}

const deleteStockIn = async (warehouseId, commodityId, quantity) => {
    try {
        const stockIn = await StockIn.findOne({ warehouseId, commodityId });

        if (stockIn) {
            stockIn.quantity = stockIn.quantity - quantity;

            if (stockIn.quantity < 0) {
                stockIn.quantity = 0;
            }
            await stockIn.save();
        }

    } catch (error) {
        console.log('message: ', 'Failed to update quantity', 'error:', error.message);
    }
}

// const updateStockIn = async (warehouseId, commodityId, quantity) => {
//     try {
//         const stockIn = await StockIn.findOne({ warehouseId, commodityId });

//         console.log('stockIn==', stockIn);
//         console.log('warehouseId, commodityId==', warehouseId, commodityId);

//         if (!stockIn) {
//             const newStockIn = new StockIn({ warehouseId, commodityId, quantity });
//             await newStockIn.save();
//         } else {
//             stockIn.quantity += quantity;
//             await stockIn.save();
//         }

//     } catch (error) {
//         console.log('message: ', 'Failed to update quantity', 'error:', error.message);
//     }
// };

const createConsignment = async (req, res, next) => {
    try {
        const { farmerId, transporterId, warehouseId, commodityId, quantity, rate, amount } = req.body;
        const newConsignment = new Consignment({ farmerId, transporterId, warehouseId, commodityId, quantity, rate, amount });
        await newConsignment.save();
        await saveStockIn(warehouseId, commodityId, quantity);
        res.status(201).json({ status: true, message: 'Consignment created successfully', data: newConsignment });
    } catch (error) {
        res.status(400).json({ status: false, message: 'Failed to create consignment', error: error.message });
    }
};

const getAllConsignments = async (req, res, next) => {
    try {
        const consignments = await Consignment.find().populate('farmerId transporterId commodityId warehouseId');
        res.json({ status: true, message: 'Consignments fetched successfully', data: consignments });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch consignments', error: error.message });
    }
};

const getConsignmentById = async (req, res, next) => {
    try {
        const consignment = await Consignment.findById(req.params.id);
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }
        res.json({ status: true, message: 'Consignment fetched successfully', data: consignment });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch consignment', error: error.message });
    }
};

const updateConsignment = async (req, res, next) => {
    try {
        const { farmerId, transporterId, warehouseId, commodityId, quantity, rate, amount } = req.body;
        const consignment = await Consignment.findByIdAndUpdate(req.params.id, { farmerId, transporterId, warehouseId, commodityId, quantity, rate, amount }, { new: true });
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        // if (Number(consignment.quantity) > Number(quantity)) {
        //     let newQuantity = Number(consignment.quantity) - Number(quantity)
        // } else {
        //     let newQuantity = Number(consignment.quantity) - Number(quantity)
        // }
        // await updateStockIn(warehouseId, commodityId, quantity);
        res.json({ status: true, message: 'Consignment updated successfully', data: consignment });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to update consignment', error: error.message });
    }
};

const deleteConsignment = async (req, res, next) => {
    try {

        const consignment = await Consignment.findById(req.params.id);
        if (!consignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        const deletedConsignment = await Consignment.findByIdAndDelete(req.params.id);
        if (!deletedConsignment) {
            return res.status(404).json({ status: false, message: 'Consignment not found' });
        }

        await deleteStockIn(consignment.warehouseId, consignment.commodityId, consignment.quantity)

        res.json({ status: true, message: 'Consignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to delete consignment', error: error.message });
    }
};

module.exports = { createConsignment, getAllConsignments, getConsignmentById, updateConsignment, deleteConsignment };
