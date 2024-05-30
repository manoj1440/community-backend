const StockIn = require('../models/stockIn');
const Farmer = require('../models/farmer');
const Transporter = require('../models/transporter');
const Customer = require('../models/customer');
const Consignment = require('../models/consignment');

const getStockInTotalQuantity = async () => {
  try {
    const totalQuantity = await StockIn.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: "$totalQuantity" } } }
    ]);
    return totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0;
  } catch (error) {
    throw new Error('Failed to get total quantity of stock-in: ' + error.message);
  }
};

const getStockInCommodityStats = async (req, res) => {
  try {
    const stats = await StockIn.aggregate([
      {
        $lookup: {
          from: 'commodities',
          localField: 'commodityId',
          foreignField: '_id',
          as: 'commodity',
        },
      },
      {
        $unwind: '$commodity',
      },
      {
        $group: {
          _id: '$commodity.name',
          totalQuantity: { $sum: '$totalQuantity' },
        },
      },
    ]);

    return stats;
  } catch (error) {
    throw new Error('Failed to getStockInCommodityStats: ' + error.message);
  }
};

const getTotalFarmersCount = async () => {
  try {
    const farmersCount = await Farmer.countDocuments();
    return farmersCount;
  } catch (error) {
    throw new Error('Failed to get total farmers count: ' + error.message);
  }
};

const getTotalCustomersCount = async () => {
  try {
    const customersCount = await Customer.countDocuments();
    return customersCount;
  } catch (error) {
    throw new Error('Failed to get total customers count: ' + error.message);
  }
};

const getTotalTransportersCount = async () => {
  try {
    const transportersCount = await Transporter.countDocuments();
    return transportersCount;
  } catch (error) {
    throw new Error('Failed to get total transporters count: ' + error.message);
  }
};

const getStockInWarehouseWiseStats = async () => {
  try {
    const stats = await StockIn.aggregate([
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      {
        $unwind: '$warehouse',
      },
      {
        $lookup: {
          from: 'commodities',
          localField: 'commodityId',
          foreignField: '_id',
          as: 'commodity',
        },
      },
      {
        $unwind: '$commodity',
      },
      {
        $group: {
          _id: {
            warehouseName: '$warehouse.name',
            commodityName: '$commodity.name',
          },
          totalQuantity: { $sum: '$totalQuantity' },
        },
      },
    ]);

    return stats;
  } catch (error) {
    throw new Error('Failed to get warehouse-wise stats of stock-in: ' + error.message);
  }
};

const getConsignmentDetailsAndCount = async (req, res, next) => {
  try {
    const consignmentDetails = await Consignment.find();
    // console.log(consignmentDetails)
    return consignmentDetails
  } catch (error) {
    throw new Error('Failed to get consignment stats of consignment: ' + error.message);
  }
}


const getDashboardStats = async (req, res, next) => {
  try {
    const totalStockInQuantity = await getStockInTotalQuantity();
    const stockInCommodityStats = await getStockInCommodityStats();
    const totalFarmersCount = await getTotalFarmersCount();
    const totalCustomersCount = await getTotalCustomersCount();
    const totalTransportersCount = await getTotalTransportersCount();
    const stockInWarehouseWiseStats = await getStockInWarehouseWiseStats();
    const consignmentData = await getConsignmentDetailsAndCount();
    res.json({
      status: true, message: 'Dashboard data fetched successfully', data: {
        totalStockInQuantity,
        stockInCommodityStats,
        totalFarmersCount,
        totalCustomersCount,
        totalTransportersCount,
        stockInWarehouseWiseStats,
        consignmentData
      }
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Failed to fetch getDashboardStats', error: error.message });
  }
};

module.exports = { getDashboardStats };
