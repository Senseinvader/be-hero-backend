const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
const User = require('../models/user');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    ActiveCase.find()
    .exec()
    .then(result => {
        console.log(result);
        if(result.length > 0) {
            res.status(200).json({
                message: 'List of activeCases has fetched',
                activeCases: result
            });
        } else {
            res.status(200).json({
                message: 'The list of activeCases is empty'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.patch('/:activeCaseId', (req, res, next) => {
    ActiveCase.findByIdAndUpdate({_id: req.params.activeCaseId}, {done: true}, {new: true})
    .exec()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'The case was marked as as Done',
            case: result
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

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