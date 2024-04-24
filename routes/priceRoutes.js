const express = require('express');
const {
    createPrice,
    getAllPrices,
    getPriceById,
    updatePriceById,
    deletePriceById,
    getPriceByWarehouseCommodity
} = require('../controllers/priceController');

const router = express.Router();

router.post('/', createPrice);
router.get('/', getAllPrices);
router.get('/:id', getPriceById);
router.get('/:warehouseId/:commodityId', getPriceByWarehouseCommodity);
router.put('/:id', updatePriceById);
router.delete('/:id', deletePriceById);

module.exports = router;
