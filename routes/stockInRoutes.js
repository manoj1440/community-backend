const express = require('express');
const {
    getAllStockIns,
    getStockInsByWarehouseId
} = require('../controllers/stockInController');

const router = express.Router();

router.get('/', getAllStockIns);
router.get('/:warehouseId', getStockInsByWarehouseId);


module.exports = router;
