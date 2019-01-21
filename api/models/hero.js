const mongoose = require('mongoose');

const heroSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    surname: String,
    password: String,
    description: String,
    level: Number,
    sessionId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Hero', heroSchema);