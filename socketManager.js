const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');
const ConnectedUsers = require('./api/models/connectedUsers');
const ActiveCaseRepository = require('./api/repositories/activeCaseRepository');
const UserRepository = require('./api/repositories/userRepository');

const connectedUsersManager = new ConnectedUsers();
const activeCaseRepository = new ActiveCaseRepository();
const userRepository = new UserRepository();

module.exports = function(socket) {
  socket.on('action', (action) => {
    switch (action.type) {
      case 'server/user-connected':
        handleUserConnectedAction(action, socket);
        break;
      case 'server/message-sent':
        handleMessageSentAction(action, socket);
        break;
      case 'server/user-disconnected':
        handleUserDisconnectedAction(socket);
        break;
      case 'server/case-created':
        handleCaseCreatedAction(action, socket);
        break;
      case 'server/case-taken':
        handleCaseTakenAction(action, socket);
        break;
      case 'server/case-completed':
        handleCaseCompletedAction(action);
        break;
      case 'server/user-is-typing':
        handleUserIsTyping(action);
        break;
      case 'server/case-displayed':
        handleCaseDisplayedAction(action);
        break;
    }
  });

  socket.on('disconnect', () => {
    handleUserDisconnectedAction(socket);
  });
}

const handleUserConnectedAction = (action, socket) => {
  connectedUsersManager.addUser(action.user, socket.id);
  activeCaseRepository.getFreeCases()
  .then(results => {
    socket.emit('action', {type: 'USER_CONNECTED', users: connectedUsersManager.getConnectedUserList(), freeCases: createCasesArray(results)});
  })
  .catch(err => socket.emit('action', {
      type: 'DISPLAY_SNACKBAR_MESSAGE', 
      snackbarVariant: 'error', 
      snackbarMessage: err
    }));
    emitUserCases(socket.id, action.user);
}

const handleMessageSentAction = (action, socket) => {
  let message = action.message;
  message.timeStamp = new Date(Date.now());
  if(connectedUsersManager.getByUserId(message.reciever)) {
    let recieverSocket = connectedUsersManager.getByUserId(message.reciever).socketId;
    io.to(recieverSocket).emit('action', {type: 'MESSAGE_RECIEVED', message: message});
  }
  if (!connectedUsersManager.getByUserId(message.reciever)) {
    console.log('Reciever is offline, message was added to DB');
  }
  activeCaseRepository.addMessage(message)
    .catch(err => socket.emit('action', {
      type: 'DISPLAY_SNACKBAR_MESSAGE', 
      snackbarVariant: 'error', 
      snackbarMessage: err
    }));
}

const handleCaseCreatedAction = (action, socket) => {
  const user = action.message.user;
  const description = action.message.description;
  activeCaseRepository.createActiveCase(description, user)
  .then(() => {
    emitPublicFreeCases();
    emitUserCases(socket.id, user);
    socket.emit('action', {
      type: 'DISPLAY_SNACKBAR_MESSAGE', 
      snackbarVariant: 'info', 
      snackbarMessage: 'Case have been created.'
    });
  })
  .catch(err => socket.emit('action', {
    type: 'DISPLAY_SNACKBAR_MESSAGE', 
    snackbarVariant: 'error', 
    snackbarMessage: err
  }));
}

const handleCaseTakenAction = (action, socket) => {
  const caseId = action.message.caseId;
  const neederId = action.message.neederId;
  const user = action.message.user;
  activeCaseRepository.markCaseTaken(caseId, user.id)
  .then(result => {
    emitPublicFreeCases();
    emitUserCases(socket.id, user);
    const neederSocketId = connectedUsersManager.getByUserId(neederId).socketId;
    emitUserCases(neederSocketId, { id: neederId, role: 'needer' });
  })
  .catch(err => socket.emit('action', {
    type: 'DISPLAY_SNACKBAR_MESSAGE', 
    snackbarVariant: 'error', 
    snackbarMessage: err
  }));
}

const handleCaseCompletedAction = (action) => {
  const completedCase = action.message.completedCase;
  userRepository.getUserById(completedCase.heroId)
  .then(result => {
    let newLevel = Number(result[0].level)
    newLevel++;
    userRepository.setUserLevel(completedCase.heroId, newLevel)
    .then(result => {
      let recieverSocket = connectedUsersManager.getByUserId(completedCase.heroId).socketId;
      io.to(recieverSocket).emit('action', {type: 'INCREMENT_HERO_LEVEL', newLevel: newLevel});
    })
    ActiveCase.deleteOne({ _id: completedCase._id })
    .exec()
    .then(result => {
      let recieverSocket = connectedUsersManager.getByUserId(completedCase.neederId).socketId;
      emitUserCases(recieverSocket, { id: completedCase.neederId, role: 'needer' });
      let recieverSocketHero = connectedUsersManager.getByUserId(completedCase.heroId).socketId;
      emitUserCases(recieverSocketHero, { id: completedCase.heroId, role: 'hero' });
    })
    .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}

const handleUserIsTyping = (action) => {
  if(connectedUsersManager.getByUserId(action.messageReciever)) {
    let recieverSocket = connectedUsersManager.getByUserId(action.messageReciever).socketId;
    io.to(recieverSocket).emit('action', {type: 'IS_TYPING', isTyping: action.isTyping, sender: action.messageSender});
  }
}

const emitUserCases = (socketId, user) => {
  activeCaseRepository.getUserCases(user.id, user.role)
  .then(results => {
    io.to(socketId).emit('action', {type: 'ACTIVE_CASES', activeCases: createCasesArray(results)});
  });
}

const emitPublicFreeCases = () => {
  activeCaseRepository.getFreeCases()
  .then(results => {
    io.sockets.emit('action', {type: 'USER_CONNECTED', users: connectedUsersManager.getConnectedUserList(), freeCases: createCasesArray(results)})
  })
  .catch(err => console.log(err));
}

const createCasesArray = (results) => {
  const cases = results.map(result => {
      return {
        _id: result.id,
        description: result.description,
        neederId: result.neederId,
        neederLogin: result.neederLogin,
        heroId: result.heroId,
        done: result.done,
        dialog: result.dialog,
        timeStamp: result.timeStamp,
        caseStatusChanged: result.caseStatusChanged
      }
    })
  return cases;
}

const handleUserDisconnectedAction = (socket) => {
  if(socket.user) {
    connectedUsersManager.removeByUserId(socket.user.id);
    io.emit('action', { type: 'USER_DISCONNECTED', users: connectedUsersManager.getConnectedUserList() });
  }
}

const handleCaseDisplayedAction = (action) => {
  const caseId = action.message.caseId;
  activeCaseRepository.markCaseDisplayed(caseId);
}
