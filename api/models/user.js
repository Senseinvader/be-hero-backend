const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: String,
    name: String,
    surname: String,
    login: String,
    password: String,
    description: String,
    level: Number,
    sessionId: String
});

module.exports = mongoose.model('User', userSchema);