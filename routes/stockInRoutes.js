const express = require('express');
const {
    createStockIn,
    getAllStockIns,
    getStockInById,
    updateStockInById,
    deleteStockInById,
    getQuantityByWarehouseAndCommodity
} = require('../controllers/stockInController');

const router = express.Router();

router.post('/', createStockIn);
router.get('/', getAllStockIns);
router.get('/:id', getStockInById);
router.put('/:id', updateStockInById);
router.get('/quantity/:warehouseId/:commodityId', getQuantityByWarehouseAndCommodity);
router.delete('/:id', deleteStockInById);

module.exports = router;
