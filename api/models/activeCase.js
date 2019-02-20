const mongoose = require('mongoose');

const Message = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  sender: String,
  reciever: String,
  contents: String,
  timeStamp: Date
});

const activeCaseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    neederId: mongoose.Schema.Types.ObjectId,
    heroId: mongoose.Schema.Types.ObjectId,
    description: { type: String, required: true },
    done: Boolean,
    dialog: [Message]
    // dialog: { type: Dialog, required: true }
});

module.exports = mongoose.model('ActiveCase', activeCaseSchema);