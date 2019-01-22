const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
const User = require('../models/user');
const mongoose = require('mongoose');

router.get('/', (req, res, next) => {
    ActiveCase.find()
    .exec()
    .then(results => {
        const response = {
            count: results.length,
            activeCases: results.map(result => {
                return {
                    description: result.description,
                    done: result.done,
                    neederId: result.neederId,
                    heroId: result.heroId,
                    id: result._id,
                    request: {
                        type: 'GET',
                        message: 'The link to see details of the case',
                        url: 'http://localhost:3000/needer-main/' + result._id
                    }
                }
            })
        }
        if(results.length > 0) {
            res.status(200).json({
                message: 'List of activeCases has fetched',
                activeCases: response
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
            case: {
                description: result.description,
                done: result.done,
                neederId: result.neederId,
                heroId: result.heroId,
                id: result._id,
                request: {
                    type: 'GET',
                    message: 'The link to see all active cases',
                    url: 'http://localhost:3000/needer-main/'
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:activeCaseId', (req, res, next) => {
    ActiveCase.find({_id: req.params.activeCaseId})
    .exec()
    .then(result => {
        res.status(200).json({
            case: {
                description: result.description,
                done: result.done,
                neederId: result.neederId,
                heroId: result.heroId,
                id: result._id,
                request: {
                    type: 'GET',
                    message: 'The link to see all active cases',
                    url: 'http://localhost:3000/needer-main/'
                }
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
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
            activeCase: {
                description: result.description,
                done: result.done,
                neederId: result.neederId,
                heroId: result.heroId,
                id: result._id,
                request: {
                    type: 'GET',
                    message: 'The link to see the details of the case',
                    url: 'http://localhost:3000/needer-main/' + result._id
                }
            }
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