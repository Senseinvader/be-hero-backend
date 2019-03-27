const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const heroRoutes = require('./api/routes/heroMain');
const neederRoutes = require('./api/routes/neederMain');
const signinRoutes = require('./api/routes/signIn');
const signupRoutes = require('./api/routes/signUp');

mongoose.connect( process.env.MONGODB_URI ||
    'mongodb://node-app:' + 
    process.env.MONGO_ATLAS_PW + 
    '@node-app-shard-00-00-nwfq3.mongodb.net:27017,node-app-shard-00-01-nwfq3.mongodb.net:27017,node-app-shard-00-02-nwfq3.mongodb.net:27017/test?ssl=true&replicaSet=node-app-shard-0&authSource=admin&retryWrites=true',
   { useNewUrlParser: true });

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, Authorization, Content-Type, Accept');
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        res.status(200).json({});
    }
    next();
});

// app.use((req, res, next) => {
//     if(req.header("Access-Token") === )
// });

app.use('/signin', signinRoutes);
app.use('/signup', signupRoutes);
app.use('/hero-main', heroRoutes);
app.use('/needer-main', neederRoutes);

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