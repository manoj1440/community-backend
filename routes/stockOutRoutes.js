const express = require('express');
const {
    createStockOut,
    getAllStockOuts,
    getStockOutById,
    updateStockOut,
    deleteStockOut
} = require('../controllers/stockOutController');

const router = express.Router();

router.post('/', createStockOut);
router.get('/', getAllStockOuts);
router.get('/:id', getStockOutById);
router.put('/:id', updateStockOut);
router.delete('/:id', deleteStockOut);

module.exports = router;
