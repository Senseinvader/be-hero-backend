const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /disabled-main'
    });
});

router.get('/:dialogueId', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /disabled-main/dialogueId',
        dialogueId: req.params.dialogueId
    });
});

router.post('/', (req, res, next) => {
    const helpRequest = {
        message: req.body.message,
        location: req.body.location
    }
    res.status(201).json({
        message: 'Help request has created',
        helpRequest: helpRequest
    });
});

module.exports = router;