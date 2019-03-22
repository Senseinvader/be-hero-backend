const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
const User = require('../models/user');
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

//Method to GET all ActiveCases (not done) in the application
// router.get('/', (req, res, next) => {
//     ActiveCase.find({done: false})
//     .exec()
//     .then(results => {
//         const response = {
//             count: results.length,
//             activeCases: results.map(result => {
//                 return {
//                     _id: result._id,
//                     description: result.description,
//                     done: result.done,
//                     neederId: result.neederId,
//                     heroId: result.heroId
//                 }
//             })
//         }
//         if(results.length > 0) {
//             res.status(200).json({
//                 message: 'List of activeCases has fetched',
//                 response: response
//             });
//         } else {
//             res.status(200).json({
//                 message: 'The list of activeCases is empty'
//             });
//         }
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });


// Method to PATCH - change the status of an ActiveCase "done" to true - mark case as accomplished
// Requires passing heroId in the request body!!!
router.patch('/my-cases/:caseId', checkAuth, (req, res, next) => {
    ActiveCase.findByIdAndUpdate(
        {
                _id: req.params.caseId, 
                neederId: req.userData.userId,
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
            error: err.message
        });
    });
});

// Method to GET the information about a particular ActiveCase by it's ID
router.get('/my-cases/:caseId', checkAuth, (req, res, next) => {
    ActiveCase.find({_id: req.params.caseId})
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
            error: err.message
        });
    });
});

// PATCH method to add a message from needer in an activeCase dialog
// router.patch('/my-cases/:caseId', checkAuth, (req, res, next) => {
//   let message = {
//     author: req.body.author,
//     contents: req.body.contents,
//     timeStamp: Date.now()
//   };
//   ActiveCase.findOne({_id: req.params.caseId},)
//     .then(activeCase => {
//       activeCase.dialog.push(message);
//       activeCase.save()
//       .then(result => {
//         res.status(201).json({
//           message: 'Message was added',
//           dialog: result
//         });
//       });
//     })
//     .catch(err => {
//       res.status(500).json({
//         error: err.message
//       });
//     });
// });

//Method to POST - create a new ActiveCase
router.post('/', checkAuth, (req, res, next) => {
    const activeCase = new ActiveCase({
        _id: new mongoose.Types.ObjectId(),
        neederId: req.userData.userId,
        neederLogin: req.userData.login,
        heroId: null,
        description: req.body.description,
        done: false,
        dialog: {},
        timeStamp: new Date(Date.now())
    });
    activeCase
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Help request has created',
            activeCase: {
                id: result._id,
                neederId: result.neederId,
                neederLogin: result.neederLogin,
                heroId: result.heroId,
                description: result.description,
                done: result.done,
                timeStamp: result.timeStamp,
                dialog: result.dialog,
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
            error: err.message
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