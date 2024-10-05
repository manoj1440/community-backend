const express = require('express');
const {
    createConsignment,
    getAllConsignments,
    getConsignmentById,
    updateConsignment,
    deleteConsignment,
    createConsignmentWebsite,
    getConsignmentsForWebsite
} = require('../controllers/consignmentController');

const router = express.Router();

router.post('/', createConsignment);

router.post('/create-consignment-website', createConsignmentWebsite)

router.get('/get-all-consignments-website', getConsignmentsForWebsite)

router.get('/', getAllConsignments);

router.get('/:id', getConsignmentById);

router.put('/:id', updateConsignment);

router.delete('/:id', deleteConsignment);


module.exports = router;
