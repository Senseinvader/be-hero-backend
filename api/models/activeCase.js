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
    neederLogin: String,
    heroId: mongoose.Schema.Types.ObjectId,
    description: { type: String, required: true },
    done: Boolean,
    dialog: [Message],
    timeStamp: Date
    // dialog: { type: Dialog, required: true }
});

module.exports = mongoose.model('ActiveCase', activeCaseSchema);