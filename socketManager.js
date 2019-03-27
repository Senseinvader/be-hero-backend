const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');
const User = require('./api/models/user');
const mongoose = require('mongoose');

let connectedUsers = [];

module.exports = function(socket) {
  socket.on('action', (action) => {
      if (action.type == 'server/user-connected') {
        let user = action.user;
        user.socketId = socket.id;
        socket.user = user;
        connectedUsers = addUser(connectedUsers, user);
        emitPrivateFreeCases(socket, connectedUsers);
        (user.role === 'hero') 
          ? emitHeroCases(socket.id, user.id) 
          : emitNeederCases(socket.id, user.id);

      } else if (action.type === 'server/message-sent') {
        let message = action.message;
        message.timeStamp = new Date(Date.now());
        if(connectedUsers.find((user) => user.id === message.reciever)) {
          let recieverSocket = connectedUsers.find((user) => user.id === message.reciever).socketId;
          io.to(recieverSocket).emit('action', {type: 'MESSAGE_RECIEVED', message: message});
        }
        if (!connectedUsers.find((user) => user.id === message.reciever)) {
          console.log('Reciever is offline, message was added to DB');
        }
        ActiveCase.findOne({_id: message.caseId})
        .exec()
        .then(activeCase => {
          activeCase.dialog.push(message);
          activeCase.save();
        })
        .catch(err => socket.emit('action', {
          type: 'DISPLAY_SNACKBAR_MESSAGE', 
          snackbarVariant: 'error', 
          snackbarMessage: err
        }));

      } else if (action.type === 'server/case-created') {
        const user = action.message.user;
        const description = action.message.description;
        const activeCase = new ActiveCase({
          _id: new mongoose.Types.ObjectId(),
          neederId: user.id,
          neederLogin: user.login,
          heroId: null,
          description: description,
          done: false,
          dialog: [],
          timeStamp: new Date(Date.now()),
          personalData: user.description
        });
        activeCase
        .save()
        .then(() => {
          emitPublicFreeCases(socket, connectedUsers);
          emitNeederCases(socket.id, user.id);
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

      } else if (action.type === 'server/case-taken') {
        const caseId = action.message.caseId;
        const neederId = action.message.neederId;
        const user = action.message.user;
        ActiveCase.findOneAndUpdate(
          {
              $and: [
                  {_id: caseId}, {done: false}, { heroId: null }
              ]
          },
          {heroId: user.id},
          {new: true}
      )
      .exec()
      .then(result => {
        emitPublicFreeCases(socket, connectedUsers);
        emitHeroCases(socket.id, user.id);
        const neederSocketId = connectedUsers.find((user) => user.id === neederId).socketId;
        emitNeederCases(neederSocketId, neederId);
        // TODO notify about case taken
      })
      .catch(err => socket.emit('action', {
        type: 'DISPLAY_SNACKBAR_MESSAGE', 
        snackbarVariant: 'error', 
        snackbarMessage: err
      }));

      } else if (action.type === 'server/case-completed') {
        const completedCase = action.message.completedCase;
        User.find(
          {
              $and: [
                  { _id: completedCase.heroId }
              ]
          },
          { level: 2 }
      )
      .exec()
      .then(result => {
        let newLevel = Number(result[0].level)
        newLevel++;
        User.findOneAndUpdate(
          {
              $and: [
                  { _id: completedCase.heroId }
              ]
          },
          { level: newLevel }
      )
      .exec()
      .then(result => {
        let recieverSocket = connectedUsers.find((user) => user.id === completedCase.heroId).socketId;
        io.to(recieverSocket).emit('action', {type: 'INCREMENT_HERO_LEVEL', newLevel: newLevel});
      })
      ActiveCase.deleteOne({ _id: completedCase._id })
      .exec()
      .then(result => {
        let recieverSocket = connectedUsers.find((user) => user.id === completedCase.neederId).socketId;
        emitNeederCases(recieverSocket, completedCase.neederId);
        let recieverSocketHero = connectedUsers.find((user) => user.id === completedCase.heroId).socketId;
        emitHeroCases(recieverSocketHero, completedCase.heroId);
      })
      .catch(err => console.log(err));
      })
      .catch(err => console.log(err));

      } else if (action.type === 'server/user-disconnected') {
        disconnectUser(socket);

      } else if(action.type ==='server/user-is-typing') {
        let recieverSocket = connectedUsers.find((user) => user.id === action.messageReciever).socketId;
        io.to(recieverSocket).emit('action', {type: 'IS_TYPING', isTyping: action.isTyping, sender: action.messageSender});
      }
    });

    socket.on('disconnect', () => {
      disconnectUser(socket);
    });
}

const emitPrivateFreeCases = (socket, connectedUsers) => {
    ActiveCase.find({heroId: null})
    .exec()
    .then(results => {
      let cases = createCasesArray(results);
      socket.emit('action', {type: 'USER_CONNECTED', users: connectedUsers, freeCases: cases})
    })
    .catch(err => socket.emit('action', {
      type: 'DISPLAY_SNACKBAR_MESSAGE', 
      snackbarVariant: 'error', 
      snackbarMessage: err
    }));
}

const emitPublicFreeCases = (socket, connectedUsers) => {
  ActiveCase.find({heroId: null})
  .exec()
  .then(results => {
    let cases = createCasesArray(results);
    io.sockets.emit('action', {type: 'USER_CONNECTED', users: connectedUsers, freeCases: cases})
  })
  .catch(err => console.log(err));
}

const emitHeroCases = (socketId, userId) => {
  ActiveCase.find({heroId: userId})
    .exec()
    .then(results => {
      let cases = createCasesArray(results);
      io.to(socketId).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})
    })
    .catch(err => {
        console.log(err)
    });
}

const emitNeederCases = (socketId, userId) => {
  ActiveCase.find({neederId: userId})
  .exec()
  .then(results => {
    let cases = createCasesArray(results);
    io.to(socketId).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})

  })
  .catch(err => {
    console.log(err)
  });
}

const postMessage = (sender, reciever, contents, caseId) => {
  let message = {
    sender: sender,
    reciever: reciever,
    contents: contents,
    timeStamp: Date.now()
  };
  ActiveCase.findOne(
    {
      $and: [
          {_id: caseId}, { heroId: sender.id }
      ]
    })
    .then(activeCase => {
      activeCase.dialog.push(message);
      activeCase.save()
    })
    .catch(err => {
      console.log(err)
    });
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
        timeStamp: result.timeStamp
      }
    })
  return cases;
}

const removeUser =(connectedUsers, id) => {
  return connectedUsers.filter(user => user.id !== id);
}

const addUser = (connectedUsers, user) => {
  return [...connectedUsers, user];
}

const disconnectUser = (socket) => {
  if(socket.user) {
    console.log('all ', connectedUsers)
    connectedUsers = removeUser(connectedUsers, socket.user.id);
    io.emit('action', {type: 'USER_DISCONNECTED', users: connectedUsers});
    console.log('disconnected ', connectedUsers)
  }
}
