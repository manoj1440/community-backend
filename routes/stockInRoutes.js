const express = require('express');
const {
    getAllStockIns
} = require('../controllers/stockInController');

const router = express.Router();

router.get('/', getAllStockIns);

module.exports = router;
