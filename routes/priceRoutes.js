const express = require('express');
const {
    createPrice,
    getAllPrices,
    getPriceById,
    updatePriceById,
    deletePriceById,
    getPriceByWarehouseCommodity,
    getPriceByWarehouseIdAndCommodityId
} = require('../controllers/priceController');

const router = express.Router();

router.post('/', createPrice);
router.get('/', getAllPrices);
router.get('/:id', getPriceById);
router.get('/all-prices/:warehouseId', getPriceByWarehouseCommodity);
router.put('/:id', updatePriceById);
router.delete('/:id', deletePriceById);
router.get('/:warehouseId/:commodityId', getPriceByWarehouseIdAndCommodityId);

module.exports = router;
