const express = require('express');
const {
    createTransporter,
    getAllTransporters,
    getTransporterById,
    updateTransporterById,
    deleteTransporterById
} = require('../controllers/transporterController');

const router = express.Router();

router.post('/', createTransporter);
router.get('/', getAllTransporters);
router.get('/:id', getTransporterById);
router.put('/:id', updateTransporterById);
router.delete('/:id', deleteTransporterById);

module.exports = router;
