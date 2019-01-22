const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
const User = require('../models/user');
const mongoose = require('mongoose');

router.get('/:dialogueId', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /needer-main/dialogueId',
        dialogueId: req.params.dialogueId
    });
});

router.post('/', (req, res, next) => {
    const activeCase = new ActiveCase({
        _id: new mongoose.Types.ObjectId(),
        neederId: req.body.userId,
        heroId: null,
        description: req.body.description,
        done: false
    });
    activeCase
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Help request has created',
            activeCase: result
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        });
    });
});

router.get('/', (req, res, next) => {
    Needer.find().exec()
    .then(result => {
        console.log(result);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;