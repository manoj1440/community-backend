const express = require('express');
const {
    addDepotCash,
    getDepotCashById,
    updateDepotCashById,
    deleteDepotCashById,
    getAllDepotCashEntries,
    revertTransaction
} = require('../controllers/depotCashController');

const router = express.Router();

router.post('/', addDepotCash);
router.get('/', getAllDepotCashEntries);
router.get('/:id', getDepotCashById);
router.delete('/:id', deleteDepotCashById);
router.put('/:transactionId', updateDepotCashById);
router.post('/revert/:transactionId', revertTransaction);

module.exports = router;
