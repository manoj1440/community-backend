const express = require('express');
const {
    getDashboardStatsValue,
    getDashboardGraphs,
    getDashboardGraphSecondSet,
    getDashboardGraphStaticValues
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/get-dashboard-stats', getDashboardStatsValue);

router.get('/dashboard-graphs', getDashboardGraphs);

router.get('/dashboard-graphs-secondset', getDashboardGraphSecondSet);

router.get('/dashboard-static-values', getDashboardGraphStaticValues);

module.exports = router;
