const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const heroRoutes = require('./api/routes/heroMain');
const disabledRoutes = require('./api/routes/neederMain');

mongoose.connect(
    'mongodb://node-app:' + 
    process.env.MONGO_ATLAS_PW + 
    '@node-apps-shard-00-00-wjxgr.mongodb.net:27017,node-apps-shard-00-01-wjxgr.mongodb.net:27017,node-apps-shard-00-02-wjxgr.mongodb.net:27017/test?ssl=true&replicaSet=node-apps-shard-0&authSource=admin&retryWrites=true', 
    {
    useMongoClient: true
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, Authorization, Contant-Type, Accept');
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        res.status(200).json({});
    }
    next();
});

app.use('/hero-main', heroRoutes);
app.use('/needer-main', disabledRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;