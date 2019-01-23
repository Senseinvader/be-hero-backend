const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');
const uuid = require('uuid/v1');

router.post('/', (req, res, next) => {
    if (req.body.userType === 'hero') {
        const hero = new User({
            role: req.body.userType,
            name: req.body.name,
            surname: req.body.surname,
            login: req.body.login,
            password: req.body.password,
            description: req.body.description,
            level: 1,
            sessionId: uuid()
        });
        hero
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Hero has created",
                hero: hero
            });
        })
        .catch(err => console.log(err));
    } else if (req.body.userType === 'needer') {
        const needer = new User({
            role: req.body.userType,
            name: req.body.name,
            surname: req.body.surname,
            login: req.body.login,
            password: req.body.password,
            description: req.body.description,
            level: 0,
            sessionId: uuid()
        });
        needer
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Needer has created",
                needer: needer
            });
        })
        .catch(err => console.log(err));
    }
});

module.exports = router;