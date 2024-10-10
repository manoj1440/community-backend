const express = require('express');
const {
    createTransporter,
    getAllTransporters,
    getTransporterById,
    updateTransporterById,
    deleteTransporterById,
    getTransportersForWebsite
} = require('../controllers/transporterController');

const router = express.Router();

router.post('/', createTransporter);
router.get('/', getAllTransporters);
router.get('/:id', getTransporterById);
router.put('/:id', updateTransporterById);
router.delete('/:id', deleteTransporterById);
router.get('/website/transporters', getTransportersForWebsite)

module.exports = router;
