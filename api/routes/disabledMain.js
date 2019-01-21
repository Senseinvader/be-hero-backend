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
    res.status(201).json({
        message: 'Handling POST requests to /disabled-main'
    });
});

module.exports = router;