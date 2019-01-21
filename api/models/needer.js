const mongoose = require('mongoose');

const neederSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    surname: String,
    password: String,
    description: String,
    sessionId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Needer', neederSchema);