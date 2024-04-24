const express = require('express');
const {
    createConsignment,
    getAllConsignments,
    getConsignmentById,
    updateConsignment,
    deleteConsignment
} = require('../controllers/consignmentController');

const router = express.Router();

router.post('/', createConsignment);
router.get('/', getAllConsignments);
router.get('/:id', getConsignmentById);
router.put('/:id', updateConsignment);
router.delete('/:id', deleteConsignment);

module.exports = router;
