const express = require('express');
const {
    createFarmer,
    getAllFarmers,
    getFarmerById,
    updateFarmerById,
    deleteFarmerById
} = require('../controllers/farmerController');

const router = express.Router();

router.post('/', createFarmer);
router.get('/', getAllFarmers);
router.get('/:id', getFarmerById);
router.put('/:id', updateFarmerById);
router.delete('/:id', deleteFarmerById);

module.exports = router;
