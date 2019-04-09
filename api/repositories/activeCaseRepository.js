const mongoose = require('mongoose');
const ActiveCase = require('../models/activeCase');

function ActiveCaseRepository() {
    this.getFreeCases = () => {
        return ActiveCase.find({heroId: null}).exec();
    }

    this.getUserCases = (userId, role) => {
        return ActiveCase.find( role === 'hero' ? { heroId : userId } : { neederId : userId } );
    }

    this.addMessage = (message) => {
        return ActiveCase.findOne({_id: message.caseId})
            .exec()
            .then(activeCase => {
            activeCase.dialog.push(message);
            activeCase.save();
            })
    }

    this.createActiveCase = (description, user) => {
        const activeCase = new ActiveCase({
            _id: new mongoose.Types.ObjectId(),
            neederId: user.id,
            neederLogin: user.login,
            heroId: null,
            description: description,
            done: false,
            dialog: [],
            timeStamp: new Date(Date.now()),
            personalData: user.description,
            heroNewMessages: 0,
            neederNewMessages: 0,
            caseStatusChanged: false
          });
          return activeCase.save();
    }

    this.markCaseTaken = (caseId, heroId) => {
        return ActiveCase.findOneAndUpdate(
            {
                $and: [
                    {_id: caseId}, {done: false}, { heroId: null }
                ]
            },
            {heroId: heroId, caseStatusChanged: true},
            // {new: true},
            {caseStatusChanged: true}
        )
        .exec();
    }

    this.markCaseDisplayed = (caseId) => {
        return ActiveCase.findOneAndUpdate(
            {
                $and: [
                    { _id: caseId }
                ]
            },
            {caseStatusChanged: false}
        )
        .exec()
    }

    this.incrementActiveCaseCountMessage = (caseId, role) => {
        return ActiveCase.findOneAndUpdate(
            {
                $and: [
                    { _id: caseId }
                ]
            },
            role === 'hero' ? {$inc: { heroNewMessages: 1 }} : {$inc: { neederNewMessages: 1 }}
        )
        .exec()
    }

    this.resetActiveCaseCountMessage = (caseId, role) => {
        return ActiveCase.findOneAndUpdate(
            {
                $and: [
                    { _id: caseId }
                ]
            },
            role === 'hero' ? {heroNewMessages: 0 } : {neederNewMessages: 0 }
        )
        .exec()
        }
}

module.exports = ActiveCaseRepository;