const express = require('express');
const router = express.Router();
const Hero = require('../models/user');
const Needer = require('../models/needer');
const mongoose = require('mongoose');

router.post('/', (req, res, next) => {
    if (req.body.userType === 'hero') {
        const hero = new Hero({
            name: req.body.name,
            surname: req.body.surname,
            password: req.body.password,
            description: req.body.description,
            level: 1,
            sessionId: mongoose.Types.ObjectId()
        });
        hero
        .save()
        .then(result => console.log(result))
        .catch(err => console.log(err));
        res.status(201).json({
            message: "Hero has created",
            hero: hero
        });
    } else {
        const needer = new Needer({
            name: req.body.name,
            surname: req.body.surname,
            password: req.body.password,
            description: req.body.description,
            sessionId: mongoose.Types.ObjectId()
        });
        needer
        .save()
        .then(result => console.log(result))
        .catch(err => console.log(err));
        res.status(201).json({
            message: "Needer has created",
            needer: needer
        });
    }
});

module.exports = router;