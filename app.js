const express = require('express');
const app = express();
const morgan = require('morgan');

const heroRoutes = require('./api/routes/heroMain');
const disabledRoutes = require('./api/routes/disabledMain');

app.use(morgan('dev'));

app.use('/hero-main', heroRoutes);
app.use('/disabled-main', disabledRoutes);

module.exports = app;