const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/', (req, res, next) => {
  User.find({email:req.body.email})
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message: 'The user with this email already exists'
      })
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
          return res.status(500).json({
            error: err
          })
        } else {
          if (req.body.userType === 'hero') {
            const hero = new User({
              _id: new mongoose.Types.ObjectId(),
              role: req.body.userType,
              name: req.body.name,
              surname: req.body.surname,
              email: req.body.email,
              login: req.body.login,
              password: hash,
              description: req.body.description,
              level: 1,
              sessionId: uuid()
            });
            hero
            .save()
            .then(result => {
                const heroToken = createToken(result.email, result._id);
                res.status(201).json({
                    message: "Hero has created",
                    user: hero,
                    token: heroToken,
                    sessionId: hero.sessionId
                });
            })
            .catch(err => console.log(err));
          } else if (req.body.userType === 'needer') {
            const needer = new User({
              _id: new mongoose.Types.ObjectId(),
              role: req.body.userType,
              name: req.body.name,
              surname: req.body.surname,
              login: req.body.login,
              password: hash,
              email: req.body.email,
              description: req.body.description,
              level: 0,
              sessionId: uuid()
          });
          needer
          .save()
          .then(result => {
              const neederToken = createToken(result.email, result._id);
              res.status(201).json({
                  message: "Needer has created",
                  user: needer,
                  token: neederToken,
                  sessionId: needer.sessionId
              });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
              });
            });
          }
        }
      });
    }
  });
});

router.delete('/:userId', (req, res, next) => {
  User.remove({_id: req.params.userId})
  .exec()
  .them(res => {
    return res.status(200).json({
      message: 'User deleted'
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
        error: err
    });
  });
});

function createToken(email, id) {
  return jwt.sign(
    {
      email: email,
      userId: id
    },
    "secret", // Or process.env.JWT_KEY , which somewhy doesn't work
    {
      expiresIn: "1h"
    }
  );
}

module.exports = router;