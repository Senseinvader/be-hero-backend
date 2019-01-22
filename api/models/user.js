const mongoose = require('mongoose');

const heroSchema = mongoose.Schema({
    role: String,
    name: String,
    surname: String,
    password: String,
    description: String,
    level: Number,
    sessionId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('User', userSchema);