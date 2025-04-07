const StockIn = require('../models/stockIn');
const Farmer = require('../models/farmer');
const Transporter = require('../models/transporter');
const Customer = require('../models/customer');
const Consignment = require('../models/consignment');
const StockOut = require('../models/stockOut');
const { DepotCash } = require('../models/depotCash');
const Commodity = require('../models/commodity');
const moment = require('moment');
const Warehouse = require('../models/warehouse');
const mongoose = require('mongoose');
const getFinancialYear = require('../utils/financialYear');
const { ObjectId } = mongoose.Types;

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

const getConsignmentCount = async (filters) => {
  try {
    const consignmentCount = await Consignment.countDocuments(filters);

    return consignmentCount;
  } catch (error) {
    throw new Error(`Failed to get consignment count with filters ${JSON.stringify(filters)}: ${error.message}`);
  }
};

const getTotalStockIn = async (filters) => {
  try {
    const stockInRecords = await StockIn.find(filters);

    const totalQuantity = stockInRecords.reduce((sum, record) => {
      return sum + (record.totalQuantity || 0);
    }, 0);

    return totalQuantity;
  } catch (error) {
    throw new Error('Failed to get total stock in count: ' + error.message);
  }
};

const getTotalBags = async (filters = {}) => {
  try {
    const totalBags = await Consignment.aggregate([
      { $match: filters },
      {
        $unwind: "$commodity"
      },
      {
        $unwind: "$commodity.bags"
      },
      {
        $group: {
          _id: null,
          totalBags: { $sum: "$commodity.bags.noOfBags" }
        }
      }
    ]);

    return totalBags.length > 0 ? totalBags[0].totalBags : 0;
  } catch (error) {
    throw new Error('Failed to get total bags: ' + error.message);
  }
};

const getTotalDepotCash = async (warehouseFilters = {}, depotCashFilters = {}) => {
  try {
    const depotCashRecords = await DepotCash.find({
      ...warehouseFilters,
      financialYear: depotCashFilters.financialYear
    });

    const totalDepotCash = depotCashRecords.reduce((total, item) => total + item.closingAmount, 0);

    return parseFloat(totalDepotCash.toFixed(2));
  } catch (error) {
    throw new Error('Failed to get total depot cash: ' + error.message);
  }
};


const getTotalAmount = async (filters = {}) => {
  try {
    const consignments = await Consignment.find(filters);

    const commodityTotals = {};
    consignments.forEach((consignment) => {
      consignment.commodity.forEach((commodityItem) => {
        const commodityId = commodityItem.commodityId.toString();
        if (!commodityTotals[commodityId]) {
          commodityTotals[commodityId] = 0;
        }
        commodityTotals[commodityId] += commodityItem.amount;
      });
    });

    const totalAmount = Object.values(commodityTotals).reduce((acc, amount) => acc + amount, 0);

    return parseFloat(totalAmount.toFixed(2));
  } catch (error) {
    throw new Error('Failed to calculate total amount: ' + error.message);
  }
};

const getCounts = async () => {
  try {
    const [commoditiesCount, farmersCount, customersCount, transportersCount] = await Promise.all([
      Commodity.countDocuments(),
      Farmer.countDocuments(),
      Customer.countDocuments(),
      Transporter.countDocuments()
    ]);

    return {
      commoditiesCount,
      farmersCount,
      customersCount,
      transportersCount,
    };
  } catch (error) {
    throw new Error('Failed to get counts: ' + error.message);
  }
};

const getTotalStats = async (filters = {}, commodityObjectIds = []) => {

  try {
    const consignmentCountPipeline = [
      { $match: filters },
      {
        $group: {
          _id: null,
          consignmentCount: { $sum: 1 },
        }
      }
    ];

    const totalAmountPipeline = [
      { $match: filters },
      {
        $project: {
          commodity: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: [commodityObjectIds, []] } }, 0] },
              then: {
                $filter: {
                  input: "$commodity",
                  as: "comm",
                  cond: { $in: ["$$comm.commodityId", commodityObjectIds] }
                }
              },
              else: "$commodity"
            }
          }
        }
      },
      { $unwind: "$commodity" },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$commodity.amount" }
        }
      }
    ];

    const totalBagsPipeline = [
      { $match: filters },
      { $unwind: "$commodity" },
      { $unwind: "$commodity.bags" },
      {
        $group: {
          _id: null,
          totalBags: { $sum: "$commodity.bags.noOfBags" }
        }
      }
    ];

    const consignmentCountResult = await Consignment.aggregate(consignmentCountPipeline);
    const totalAmountResult = await Consignment.aggregate(totalAmountPipeline);
    const totalBagsResult = await Consignment.aggregate(totalBagsPipeline);

    const consignmentCount = consignmentCountResult.length > 0 ? consignmentCountResult[0].consignmentCount : 0;
    const totalAmount = totalAmountResult.length > 0 ? parseFloat(totalAmountResult[0].totalAmount.toFixed(2)) : 0;
    const totalBags = totalBagsResult.length > 0 ? totalBagsResult[0].totalBags : 0;

    return {
      consignmentCount,
      totalAmount,
      totalBags
    };

  } catch (error) {
    throw new Error('Failed to get total stats: ' + error);
  }
};

const getDashboardStatsValue = async (req, res, next) => {
  try {
    let { warehouses, commodities, startDate, endDate } = req.query;

    warehouses = warehouses ? warehouses.split(',') : [];
    commodities = commodities ? commodities.split(',') : [];

    const warehouseObjectIds = warehouses.map(id => new ObjectId(id));
    const commodityObjectIds = commodities.map(id => new ObjectId(id));

    let filters = {};
    let warehouseFilters = {};

    if (warehouseObjectIds.length > 0) {
      filters.warehouseId = { $in: warehouseObjectIds };
      warehouseFilters.warehouseId = { $in: warehouseObjectIds };
    }

    if (commodityObjectIds.length > 0) {
      filters['commodity.commodityId'] = { $in: commodityObjectIds };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {
        filters.createdAt = {
          $gte: new Date(start.setUTCHours(0, 0, 0, 0)),
          $lt: new Date(end.setUTCHours(23, 59, 59, 999))
        };
      } else {
        console.error("Invalid date values provided.");
      }
    }

    const stockInFilters = {};
    if (warehouseObjectIds.length > 0) {
      stockInFilters.warehouseId = { $in: warehouseObjectIds };
    }
    if (commodityObjectIds.length > 0) {
      stockInFilters.commodityId = { $in: commodityObjectIds };
    }

    let depotCashFilters = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {
        stockInFilters.createdAt = {
          $gte: new Date(start.setUTCHours(0, 0, 0, 0)),
          $lt: new Date(end.setUTCHours(23, 59, 59, 999)),
        };

        const financialYear = getFinancialYear(start);
        stockInFilters.financialYear = financialYear;
        depotCashFilters.financialYear = financialYear;
      }
    }


    const { consignmentCount, totalAmount, totalBags } = await getTotalStats(filters, commodityObjectIds);

    const [totalStockIn, totalDepotCash] = await Promise.all([
      getTotalStockIn(stockInFilters),
      getTotalDepotCash(warehouseFilters, depotCashFilters),

    ]);

    res.status(200).json({
      status: true,
      data: {
        consignmentCount,
        totalStockIn,
        totalBags,
        totalDepotCash,
        totalAmount
      }
    });

  } catch (error) {
    next(error);
  }
};

const getDashboardGraphs = async (req, res, next) => {
  try {
    let { warehouses, commodities, startDate, endDate } = req.query;

    warehouses = warehouses ? warehouses.split(',') : [];
    commodities = commodities ? commodities.split(',') : [];

    const warehouseObjectIds = warehouses.map(id => new ObjectId(id));
    const commodityObjectIds = commodities.map(id => new ObjectId(id));

    let filters = {};

    if (warehouseObjectIds.length > 0) {
      filters.warehouseId = { $in: warehouseObjectIds };
    }

    if (commodityObjectIds.length > 0) {
      filters['commodity.commodityId'] = { $in: commodityObjectIds };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {
        filters.createdAt = {
          $gte: new Date(start.setUTCHours(0, 0, 0, 0)),
          $lt: new Date(end.setUTCHours(23, 59, 59, 999))
        };
      } else {
        console.error("Invalid date values provided.");
      }
    }


    if (
      warehouseObjectIds.length === 0 &&
      commodityObjectIds.length === 0 &&
      (!startDate || !endDate)
    ) {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 20);

      filters.createdAt = {
        $gte: new Date(tenDaysAgo.setUTCHours(0, 0, 0, 0)),
        $lt: new Date(today.setUTCHours(23, 59, 59, 999)),
      };
    }

    // Graph 1

    const consignments = await Consignment.find(filters);

    const consignmentsByDate = {};
    consignments.forEach((consignment) => {
      const consignmentDate = moment(consignment.createdAt).format('YYYY-MM-DD');
      if (consignmentsByDate[consignmentDate]) {
        consignmentsByDate[consignmentDate]++;
      } else {
        consignmentsByDate[consignmentDate] = 1;
      }
    });

    const barChartData = {
      labels: Object.keys(consignmentsByDate),
      datasets: [
        {
          label: 'Consignments',
          data: Object.values(consignmentsByDate),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    // Graph 2

    let stockOutFilters = {};

    if (warehouseObjectIds.length > 0) {
      filters.warehouseId = { $in: warehouseObjectIds };
    }

    if (commodityObjectIds.length > 0) {
      filters.commodityId = { $in: commodityObjectIds };
    }

    const stockOuts = await StockOut.find(stockOutFilters);

    const stockOutsByDate = {};
    stockOuts.forEach((stockOut) => {
      const stockOutDate = moment(stockOut.createdAt).format('YYYY-MM-DD');
      if (stockOutsByDate[stockOutDate]) {
        stockOutsByDate[stockOutDate]++;
      } else {
        stockOutsByDate[stockOutDate] = 1;
      }
    });

    const stockOutBarData = {
      labels: Object.keys(stockOutsByDate),
      datasets: [
        {
          label: 'StockOuts',
          data: Object.values(stockOutsByDate),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    };


    // Graph 3

    const stockInCommodityStatsData = await getStockInCommodityStats();

    const stockInCommodityStats = {
      labels: stockInCommodityStatsData.map((stat) => stat._id),
      datasets: [
        {
          data: stockInCommodityStatsData.map((stat) => stat.totalQuantity),
          backgroundColor: stockInCommodityStatsData.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
        },
      ],
    };

    // Graph 4

    const stockInWarehouseWiseStats = await getStockInWarehouseWiseStats();

    const StockInWarehouseData = {
      labels: stockInWarehouseWiseStats.map((stat) => `${stat._id.warehouseName} - ${stat._id.commodityName}`),
      datasets: [
        {
          data: stockInWarehouseWiseStats.map((stat) => stat.totalQuantity),
          backgroundColor: stockInWarehouseWiseStats.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: { barChartData, stockOutBarData, stockInCommodityStats, StockInWarehouseData }
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardGraphSecondSet = async (req, res, next) => {
  try {
    let { warehouses, commodities, startDate, endDate } = req.query;

    warehouses = warehouses ? warehouses.split(',') : [];
    commodities = commodities ? commodities.split(',') : [];

    const warehouseObjectIds = warehouses.map(id => new ObjectId(id));
    const commodityObjectIds = commodities.map(id => new ObjectId(id));

    let filters = {};
    let warehouseFilters = {};

    if (warehouseObjectIds.length > 0) {
      filters.warehouseId = { $in: warehouseObjectIds };
      warehouseFilters.warehouseId = { $in: warehouseObjectIds };
    }

    if (commodityObjectIds.length > 0) {
      filters['commodity.commodityId'] = { $in: commodityObjectIds };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {
        filters.createdAt = {
          $gte: new Date(start.setUTCHours(0, 0, 0, 0)),
          $lt: new Date(end.setUTCHours(23, 59, 59, 999))
        };
      } else {
        console.error("Invalid date values provided.");
      }
    }

    if (
      warehouseObjectIds.length === 0 &&
      commodityObjectIds.length === 0 &&
      (!startDate || !endDate)
    ) {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(today.getDate() - 20);

      filters.createdAt = {
        $gte: new Date(tenDaysAgo.setUTCHours(0, 0, 0, 0)),
        $lt: new Date(today.setUTCHours(23, 59, 59, 999)),
      };
    }

    const consignments = await Consignment.find(filters);

    const totalQuantityByDate = consignments.reduce((acc, consignment) => {
      const date = moment(consignment.createdAt).format('YYYY-MM-DD');
      const quantity = consignment.commodity.reduce((sum, item) => sum + item.totalQuantity, 0);
      acc[date] = (acc[date] || 0) + quantity;
      return acc;
    }, {});

    const totalAmountByDate = consignments.reduce((acc, consignment) => {
      const date = moment(consignment.createdAt).format('YYYY-MM-DD');
      acc[date] = (acc[date] || 0) + consignment.totalAmount;
      return acc;
    }, {});

    const totalBagsByDate = {};
    consignments.forEach(consignment => {
      const date = moment(consignment.createdAt).format('YYYY-MM-DD');
      if (!totalBagsByDate[date]) {
        totalBagsByDate[date] = 0;
      }
      consignment.commodity.forEach(commodity => {
        commodity.bags.forEach(bag => {
          totalBagsByDate[date] += bag.noOfBags;
        });
      });
    });


    const totalQuantityLineData = {
      labels: Object.keys(totalQuantityByDate),
      datasets: [
        {
          label: 'Total Quantity',
          data: Object.values(totalQuantityByDate),
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.1,
        },
      ],
    };

    const totalAmountLineData = {
      labels: Object.keys(totalAmountByDate),
      datasets: [
        {
          label: 'Total Amount',
          data: Object.values(totalAmountByDate),
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.1,
        },
      ],
    };

    const totalBagsLineData = {
      labels: Object.keys(totalBagsByDate),
      datasets: [
        {
          label: 'Total Number of Bags',
          data: Object.values(totalBagsByDate),
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    };

    const depotCashDetails = await DepotCash.find();
    const warehousess = await Warehouse.find();

    const depotCashData = {
      labels: depotCashDetails.map((item) => {
        const warehouse = warehousess.find((warehouse) => warehouse._id.toString() === item.warehouseId.toString());
        return warehouse ? warehouse.name : "Unknown Warehouse";
      }),
      datasets: [
        {
          label: 'Depot Cash Amount',
          data: depotCashDetails.map((item) => item.closingAmount),
          backgroundColor: depotCashDetails.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: { totalQuantityLineData, totalAmountLineData, totalBagsLineData, depotCashData },
    });
  } catch (error) {
    console.error('Error fetching dashboard graph second set:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard graph second set',
    });
  }
};

const getDashboardGraphStaticValues = async (req, res, next) => {
  try {
    const counts = await getCounts();
    res.status(200).json({
      status: true,
      data: { counts },
    });
  } catch (error) {
    console.error('Error fetching dashboard graph static values:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve dashboard graph static values.',
      error: error.message,
    });
  }
};


module.exports = { getDashboardStatsValue, getDashboardGraphs, getDashboardGraphSecondSet, getDashboardGraphStaticValues };
