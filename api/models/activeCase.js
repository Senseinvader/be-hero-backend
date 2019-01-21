const mongoose = require('mongoose');

const activeCaseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    neederId: mongoose.Schema.Types.ObjectId,
    heroId: mongoose.Schema.Types.ObjectId,
    description: String,
    done: Boolean,
    name: String,
    surname: String,
    password: String,
    description: String,
    level: Number,
    sessionId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('ActiveCase', activeCaseSchema);