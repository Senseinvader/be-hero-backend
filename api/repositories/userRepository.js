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

    this.setUserLevel = (userId, newLevel) => {
        return User.findOneAndUpdate(
            {
                $and: [
                    { _id: userId }
                ]
            },
            { level: newLevel }
        )
        .exec()
    }
}

module.exports = UserRepository;