const express = require('express');
const {
    createCommodity,
    getAllCommodities,
    getCommodityById,
    updateCommodityById,
    deleteCommodityById
} = require('../controllers/commodityController');

const router = express.Router();

router.post('/', createCommodity);
router.get('/', getAllCommodities);
router.get('/:id', getCommodityById);
router.put('/:id', updateCommodityById);
router.delete('/:id', deleteCommodityById);

module.exports = router;
