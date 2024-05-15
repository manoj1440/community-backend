const express = require('express');
const {
    addDepotCash,
    getDepotCashById,
    updateDepotCashById,
    deleteDepotCashById,
    getAllDepotCashEntries
} = require('../controllers/depotCashController');

const router = express.Router();

router.post('/', addDepotCash);
router.get('/', getAllDepotCashEntries);
router.get('/:id', getDepotCashById);
router.put('/:id', updateDepotCashById);
router.delete('/:id', deleteDepotCashById);

module.exports = router;
