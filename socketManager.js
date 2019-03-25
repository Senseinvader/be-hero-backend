const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');
const mongoose = require('mongoose');

let connectedUsers = [];

module.exports = function(socket) {
  socket.on('action', (action) => {
      if (action.type == 'server/user-connected') {
        let user = action.user;
        user.socketId = socket.id;
        socket.user = user;
        connectedUsers = addUser(connectedUsers, user);
        emitFreeCases(socket, connectedUsers);
        (user.role === 'hero') 
          ? emitHeroCases(socket.id, user) 
          : emitNeederCases(socket.id, user);

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
        .catch(err => {
          console.log(err);
        });

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
          timeStamp: new Date(Date.now())
        });
        activeCase
        .save()
        .then(() => {
          emitFreeCases(socket, connectedUsers);
          emitNeederCases(socket.id, user);
        })
        .catch(err => console.log(err));

      } else if (action.type === 'server/case-taken') {
        const caseId = action.message.caseId;
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
        emitFreeCases(socket, connectedUsers);
      })

      } else if (action.type === 'server/user-disconnected') {
        disconnectUser(socket);
      }
    });

    socket.on('disconnect', () => {
      disconnectUser(socket);
    });
}

const emitFreeCases = (socket, connectedUsers) => {
    ActiveCase.find({heroId: null})
    .exec()
    .then(results => {
      let cases = createCasesArray(results);
      socket.emit('action', {type: 'USER_CONNECTED', users: connectedUsers, freeCases: cases})
    })
    .catch(err => {
        console.log(err);
    });
}

const emitHeroCases = (socketId, user) => {
  ActiveCase.find({heroId: user.id})
    .exec()
    .then(results => {
      let cases = createCasesArray(results);
      io.to(socketId).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})
    })
    .catch(err => {
        console.log(err)
    });
}

const emitNeederCases = (socketId, user) => {
  ActiveCase.find({neederId: user.id})
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
        heroId: result.heroId,
        done: result.done,
        dialog: result.dialog
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
