const express = require('express');
const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomerById,
    deleteCustomerById
} = require('../controllers/customerController');

const router = express.Router();

router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomerById);
router.delete('/:id', deleteCustomerById);

module.exports = router;
