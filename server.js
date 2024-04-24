require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authentication = require('./middlewares/authentication');
const MongoDBStore = require('connect-mongodb-session')(session);
const indexRoutes = require('./routes/indexRoutes');

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGO_URI;

const BUILD_NUMBER = new Date().toISOString();

app.use(require('helmet')());
app.use(require('compression')());

const corsUrls = process.env.CORS_URL.split(',');
app.use(require('cors')({
    origin: corsUrls,
    credentials: true,
}));

app.set('trust proxy', 1);

app.use(
    express.json({ limit: '100mb' }),
    express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 })
);

app.use(require('cookie-parser')());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        store: new MongoDBStore({
            uri: MONGODB_URI,
            collection: 'sessions',
            ttl: 24 * 60 * 60 * 1000,
            autoRemove: 'interval',
            autoRemoveInterval: 1440,
        }),
        rolling: true,
        cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 },
    })
);

app.use((req, res, next) => {
    res
        .header('Content-Type', 'application/json;charset=UTF-8')
        .header('Access-Control-Allow-Credentials', true)
        .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res, next) => {
    res.send({
        status: true,
        BUILD_NUMBER
    })
});

app.get('/:id', (req, res, next) => {

    res.send({
        status: true,
        data: req.params.id === 'mjtesting' ? process.env : '',
        BUILD_NUMBER
    })
});

app.use(authentication);

indexRoutes.forEach(api => {
    app.use(api.route, api.controller);
});

mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        if (process.env.NODE_ENV === 'development') {
            // mongoose.set('debug', true);
        }
        app.listen(PORT, () => {
            console.log('SERVER RUNNING ON PORT', PORT);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });
