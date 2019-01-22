const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mongoose = require('mongoose');

router.post('/', (req, res, next) => {
    if (req.body.userType === 'hero') {
        const hero = new User({
            name: req.body.name,
            surname: req.body.surname,
            password: req.body.password,
            description: req.body.description,
            level: 1,
            sessionId: mongoose.Types.ObjectId()
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
    } else {
        const needer = new User({
            name: req.body.name,
            surname: req.body.surname,
            password: req.body.password,
            description: req.body.description,
            sessionId: mongoose.Types.ObjectId()
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