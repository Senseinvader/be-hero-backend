const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const uuid = require('uuid/v1');

router.get('/', (req, res, next) => {
    let sessionId = req.header("Access-Token");
    if(sessionId) {
        User.find({sessionId: sessionId})
        .select('_id role name surname description level sessionId')
        .exec()
        .then(result => {
            console.log(result);
            if(result) {
                res.status(200).json({
                    loggedIn: true,
                    user: result
                });
            } else {
                res.status(200).json({
                    loggedIn: false
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
    } else {
        res.status(200).json({
            loggedIn: false
        });
    }
});


router.post('/', (req, res, next) => {
    User.findOneAndUpdate(
        {
            $and: [
                {password: req.body.password}, {login: req.body.login}
            ]
        },
        {sessionId: uuid()},
        {new: true}
    )
    .select('_id role name surname description level sessionId')
    .exec()
    .then(result => {
        console.log(result);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: 'Hero with these credentials doesn\'t exist'
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
});

module.exports = router;