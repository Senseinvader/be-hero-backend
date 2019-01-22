const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    role: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    login: { type: String, required: true },
    password: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: Number, required: true },
    sessionId: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);