const express = require('express');
const {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouseById,
    deleteWarehouseById
} = require('../controllers/warehouseController');

const router = express.Router();

router.post('/', createWarehouse);
router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.put('/:id', updateWarehouseById);
router.delete('/:id', deleteWarehouseById);

module.exports = router;
