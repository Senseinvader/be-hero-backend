const mongoose = require('mongoose');
const User = require('../models/user');

function UserRepository() {

    this.getUserById = (userId) => {
        return User.find(
            {
                $and: [
                    { _id: userId }
                ]
            },
            { level: 2 }
          )
          .exec()
    }

    this.incrementUserLevel = (userId) => {
        return User.findOneAndUpdate(
            {
                $and: [
                    { _id: userId }
                ]
            },
            {$inc: { level: 1 }}
        )
        .exec()
    }
}

module.exports = UserRepository;