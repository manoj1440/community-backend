const authRoutes = require('./authRoutes');
const warehouseRoutes = require('./warehouseRoutes');
const userRoutes = require('./userRoutes');
const commodityRoutes = require('./commodityRoutes');
const farmerRoutes = require('./farmerRoutes');
const transporterRoutes = require('./transporterRoutes');
const customerRoutes = require('./customerRoutes');
const consignmentRoutes = require('./consignmentRoutes')
const priceRoutes = require('./priceRoutes');
const stockInRoutes = require('./stockInRoutes');
const stockOutRoutes = require('./stockOutRoutes');

module.exports = [
    {
        route: '/api',
        controller: authRoutes
    },
    {
        route: '/api/user',
        controller: userRoutes
    },
    {
        route: '/api/warehouse',
        controller: warehouseRoutes
    },
    {
        route: '/api/commodity',
        controller: commodityRoutes
    },
    {
        route: '/api/farmer',
        controller: farmerRoutes
    },
    {
        route: '/api/transporter',
        controller: transporterRoutes
    },
    {
        route: '/api/customer',
        controller: customerRoutes
    },
    {
        route: '/api/price',
        controller: priceRoutes
    },
    {
        route: '/api/consignment',
        controller: consignmentRoutes
    },
    {
        route: '/api/stock-in',
        controller: stockInRoutes
    },
    {
        route: '/api/stock-out',
        controller: stockOutRoutes
    },
]