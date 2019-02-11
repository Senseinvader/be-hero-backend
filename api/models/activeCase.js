const mongoose = require('mongoose');

const activeCaseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    neederId: mongoose.Schema.Types.ObjectId,
    heroId: mongoose.Schema.Types.ObjectId,
    description: { type: String, required: true },
    done: Boolean,
    dialog: { type: Map, of: String, required: true }
    // dialog: { type: Dialog, required: true }
});

module.exports = mongoose.model('ActiveCase', activeCaseSchema);