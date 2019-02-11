const mongoose = require('mongoose');

const dialogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    activeCaseId: mongoose.Schema.Types.ObjectId,
    messageList: { type: Map, of: String, required: true }
});

module.exports = mongoose.Schema('Dialog', dialogSchema);