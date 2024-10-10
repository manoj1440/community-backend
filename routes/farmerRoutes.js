const express = require('express');
const {
    createFarmer,
    getAllFarmers,
    getFarmerById,
    updateFarmerById,
    deleteFarmerById,
    getFarmersForWebsite
} = require('../controllers/farmerController');

const router = express.Router();

router.post('/', createFarmer);
router.get('/', getAllFarmers);
router.get('/:id', getFarmerById);
router.put('/:id', updateFarmerById);
router.delete('/:id', deleteFarmerById);
router.get('/website/farmers', getFarmersForWebsite)

module.exports = router;
