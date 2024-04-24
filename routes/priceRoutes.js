const express = require('express');
const {
    createPrice,
    getAllPrices,
    getPriceById,
    updatePriceById,
    deletePriceById
} = require('../controllers/priceController');

const router = express.Router();

router.post('/', createPrice);
router.get('/', getAllPrices);
router.get('/:id', getPriceById);
router.put('/:id', updatePriceById);
router.delete('/:id', deletePriceById);

module.exports = router;
