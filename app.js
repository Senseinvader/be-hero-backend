const express = require('express');
const app = express();

const heroRoutes = require('./api/routes/heroMain');
const disabledRoutes = require('./api/routes/disabledMain');

app.use('/hero-main', heroRoutes);
app.use('/disabled-main', disabledRoutes);

module.exports = app; 