const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
const User = require('../models/user');
const mongoose = require('mongoose');

//Method to GET all ActiveCases (not done) in the application
router.get('/', (req, res, next) => {
    ActiveCase.find({done: false})
    .exec()
    .then(results => {
        const response = {
            count: results.length,
            activeCases: results.map(result => {
                return {
                    _id: result._id,
                    description: result.description,
                    done: result.done,
                    neederId: result.neederId,
                    heroId: result.heroId,
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
                response: response
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


// Method to PATCH - change the status of an ActiveCase "done" to true - mark case as accomplished
router.patch('/:activeCaseId', (req, res, next) => {
    ActiveCase.findByIdAndUpdate(
        {
                _id: req.params.activeCaseId, 
                neederId: req.body.neederId,
                heroId: req.body.heroId
        },
        {done: true}, 
        {new: true})
    .exec()
    .then(result => {
        console.log('result', result)
        increaseHeroLevel(result.heroId);
        res.status(201).json({
            message: 'The case was marked as as Done',
            case: {
                _id: result._id,
                description: result.description,
                done: result.done,
                neederId: result.neederId,
                heroId: result.heroId,
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

// Method to GET the information about a particular ActiveCase by it's ID
router.get('/:activeCaseId', (req, res, next) => {
    ActiveCase.find({_id: req.params.activeCaseId})
    .exec()
    .then(result => {
        if (!result) {
            res.status(404).json({
                message: 'No such case in database'
            });
        }
        res.status(200).json({
            case: result
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

//Method to POST - create a new ActiveCase
router.post('/', (req, res, next) => {
    const activeCase = new ActiveCase({
        _id: new mongoose.Types.ObjectId(),
        neederId: req.body.userId,
        heroId: null,
        description: req.body.description,
        done: false,
        dialog: {}
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

function increaseHeroLevel(heroId) {
    User.findById(
        {_id: heroId}
    ).exec()
    .then(result => {
        return result;
    })
    .then(result => {
        let newLevel = result.level + 1;
        User.update({_id: heroId}, {level: newLevel})
        .exec()
        .then(result => {
            return result;
        })
    })
    .catch(err => {
        res.status(500).json({
            error:err
        })
    });
}

module.exports = router;