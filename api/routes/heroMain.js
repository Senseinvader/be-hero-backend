const express = require('express');
const router = express.Router();
const ActiveCase = require('../models/activeCase');
// const Message = require('../models/message');
const checkAuth = require('../middleware/check-auth');

//Method to GET all activeCases, that are not taken by other Heroes
// router.get('/', (req, res, next) => {
//     ActiveCase.find({heroId: null})
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
//                 activeCases: response
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

// Method to GET activeCases only taken by the hero
// router.get('/my-cases', checkAuth, (req, res, next) => {
//     ActiveCase.find({heroId: req.userData.userId})
//     .exec()
//     .then(results => {
//         const cases = {
//             activeCases: results.map(result => {
//                 return {
//                     _id: result._id,
//                     description: result.description,
//                     neederId: result.neederId,
//                     heroId: result.heroId,
//                     done: result.done,
//                     request: {
//                         type: 'GET',
//                         message: 'The link to see all available cases',
//                         url: 'http://localhost:3000/hero-main/'
//                     }
//                 }
//             })
//         }
//         if(results.length > 0) {
//             res.status(200).json({
//                 message: 'List of your activeCases has fetched',
//                 cases: cases
//             });
//         } else {
//             res.status(200).json({
//                 message: 'The list of your activeCases is empty'
//             });
//         }
//     })
//     .catch(err => {
//         res.status(500).json({
//             error: err.message
//         })
//     });
// })

// Method to GET/caseId particular case info and have access to chat
router.get('/my-cases/:caseId', checkAuth, (req, res, next) => {
    ActiveCase.find({_id: req.params.caseId})
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
            error: err.message
        });
    });
});

// router.get('/mycases=true', (req, res, next) => {
//     ActiveCase.find({})
// });

//Method to PATCH - receive the ActiveCase to have it in Hero's tasks
// TODO: In GET request we need to send the user's ID!!!
router.patch('/:caseId', checkAuth, (req, res, next) => {
    ActiveCase.findOneAndUpdate(
        {
            $and: [
                {_id: req.params.caseId}, {done: false}, { heroId: null }
            ]
        },
        {heroId: req.userData.userId},
        {new: true}
    )
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'You successfully assigned for the Active Case',
            case: result,
            request: {
                type: 'GET',
                url: 'http://localhost:4000/hero-main/my-cases/' + result._id
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err.message
        });
    });
});

// PATCH method to add a message from hero in an activeCase dialog
router.patch('/my-cases/:caseId', checkAuth, (req, res, next) => {
  let message = {
    author: req.body.author,
    contents: req.body.contents,
    timeStamp: Date.now()
  };
  ActiveCase.findOne(
    {
      $and: [
          {_id: req.params.caseId}, { heroId: req.userData.userId }
      ]
    })
    .then(activeCase => {
      activeCase.dialog.push(message);
      activeCase.save()
      .then(result => {
        res.status(201).json({
          message: 'Message was added',
          dialog: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err.message
        });
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err.message
      });
    });
});

module.exports = router;