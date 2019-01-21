const express = require('express');
const app = express();
const morgan = require('morgan');

const heroRoutes = require('./api/routes/heroMain');
const disabledRoutes = require('./api/routes/disabledMain');

app.use(morgan('dev'));

app.use('/hero-main', heroRoutes);
app.use('/disabled-main', disabledRoutes);

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