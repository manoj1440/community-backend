const express = require('express');
const router = express.Router();
const multer = require('multer');
const mergeController = require('../controllers/mergeController');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/price', mergeController.mergePrice);

router.post('/farmer', mergeController.mergeFarmer);

router.post('/transporter', mergeController.mergeTransporter);

router.post('/consignments', mergeController.mergeConsignments);

router.post('/add-consignment', upload.single('file'), mergeController.mergeNewConsignment);

module.exports = router;