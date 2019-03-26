const mongoose = require('mongoose');

const Message = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  sender: String,
  reciever: String,
  author: String,
  contents: String,
  timeStamp: Date
});

const activeCaseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    neederId: mongoose.Schema.Types.ObjectId,
    neederLogin: String,
    heroLogin: String,
    heroId: mongoose.Schema.Types.ObjectId,
    description: { type: String, required: true },
    done: Boolean,
    dialog: [Message],
    timeStamp: Date,
    // If case status changed notify user about it
    newMessages: Number,
    caseStatusChanged: Boolean
});

module.exports = mongoose.model('ActiveCase', activeCaseSchema);