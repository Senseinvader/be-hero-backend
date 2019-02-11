const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const uuid = require('uuid/v1');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/', (req, res, next) => {
  User.findOneAndUpdate(
    {email: req.body.email},
    {sessionId: uuid()},
    {new: true}
  )
  .exec()
  .then(user => {
      if (user.length < 1) {
          return res.status(401).json({
              message: 'Auth falied 1'
          });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Auth falied 2'
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id
            },
            "secret", // Or process.env.JWT_KEY , which somewhy doesn't work
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: 'Auth successful',
            token: token,
            user: user,
            sessionId: user.sessionId
          });
        }
        res.status(401).json({
          message: 'Auth falied 3'
        })
      });
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({
          error:err
      })
  })
});


// router.post('/', (req, res, next) => {
//     User.findOneAndUpdate(
//         {
//             $and: [
//                 {password: req.body.password}, 
//                 {login: req.body.login}
//             ]
//         },
//         {sessionId: uuid()},
//         {new: true}
//     )
//     .select('_id role name surname description level sessionId')
//     .exec()
//     .then(result => {
//         console.log(result);
//         if (result) {
//             res.status(200).json(result);
//         } else {
//             res.status(404).json({
//                 message: 'Hero with these credentials doesn\'t exist'
//             })
//         }
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         })
//     })
// });

module.exports = router;