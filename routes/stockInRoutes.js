const express = require('express');
const {
    createStockIn,
    getAllStockIns,
    getStockInById,
    updateStockInById,
    deleteStockInById,
    updateQuantityByWarehouseAndCommodity
} = require('../controllers/stockInController');

const router = express.Router();

router.post('/', createStockIn);
router.get('/', getAllStockIns);
router.get('/:id', getStockInById);
router.put('/:id', updateStockInById);
router.put('/quantity/:id', updateQuantityByWarehouseAndCommodity);
router.delete('/:id', deleteStockInById);

module.exports = router;
