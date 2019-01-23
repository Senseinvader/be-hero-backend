const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');

//Method to GET all activeCases, that are not taken by other Heroes
router.get('/', (req, res, next) => {
    ActiveCase.find({heroId: null})
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

//Method to GET/caseId particular case info and have access to chat
router.get('/:activeCaseId', (req, res, next) => {
    ActiveCase.find({_id: req.params.activeCaseId})
    .exec()
    .then(result => {
        if(!result) {
            res.status(404).json({
                message: 'No such active case'
            })
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

// router.get('/mycases=true', (req, res, next) => {
//     ActiveCase.find({})
// });

//Method to PATCH - receive the ActiveCase to have it in Hero's tasks
// TODO: In GET request we need to send the user's ID!!!
router.patch('/:activeCaseId', (req, res, next) => {
    ActiveCase.findOneAndUpdate(
        {
            $and: [
                {_id: req.params.activeCaseId}, {done: false}
            ]
        },
        {heroId: req.body.heroId},
        {new: true}
    )
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'You successfully assigned for the Active Case',
            case: result,
            request: {
                type: 'GET',
                url: 'http://localhost:4000/hero-main/' + result._id
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;