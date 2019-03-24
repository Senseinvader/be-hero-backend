const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');

let connectedUsers = [];

let chats = [];

module.exports = function(socket) {
  socket.on('action', (action) => {
      if (action.type == 'server/user-connected') {
        let user = action.user;
        user.socketId = socket.id;
        socket.user = user;
        console.log('socket user ',socket.user);
        connectedUsers.push({userId: user.id, role: user.role, level: user.level, socketId: user.socketId});
        emitFreeCases(socket, connectedUsers);
        if(user.role === 'hero') {
          emitHeroCases(socket, user)
        } else {
          emitNeederCases(socket, user);
        }

      } else if (action.type === 'server/message-sent') {
        let message = action.message;
        message.timeStamp = new Date(Date.now());
        if(connectedUsers.find((user) => user.userId === message.reciever)) {
          let recieverSocket = connectedUsers.find((user) => user.userId === message.reciever).socketId;
          io.to(recieverSocket).emit('action', {type: 'MESSAGE_RECIEVED', message: message});
        }
        if (!connectedUsers.find((user) => user.userId === message.reciever)) {
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
      } else if (action.type === 'server/user-disconnected') {
        if(socket.user) {
          disconnectUser(socket.user.id);
        }
      }
    });

    socket.on('disconnect', () => {
      if(socket.user) {
        disconnectUser(socket.user.id);
      }
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

const emitHeroCases = (socket, user) => {
  ActiveCase.find({heroId: user.id})
    .exec()
    .then(results => {
      let cases = createCasesArray(results);
      io.to(socket.id).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})
    })
    .catch(err => {
        console.log(err)
    });
}

const emitNeederCases = (socket, user) => {
  ActiveCase.find({neederId: user.id})
  .exec()
  .then(results => {
    let cases = createCasesArray(results);
    io.to(socket.id).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})

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
  return connectedUsers.filter(user => user.userId !== id);
}

const disconnectUser = (id) => {
  console.log('all ', connectedUsers)
  connectedUsers = removeUser(connectedUsers, id);
  io.emit('action', {type: '', users: connectedUsers});
  console.log('disconnected ', connectedUsers)
}



        // const cases = {
        //     activeCases: results.map(result => {
        //         return {
        //             _id: result._id,
        //             description: result.description,
        //             neederId: result.neederId,
        //             heroId: result.heroId,
        //             done: result.done,
        //             dialog: result.dialog
        //             request: {
        //                 type: 'GET',
        //                 message: 'The link to see all available cases',
        //                 url: 'http://localhost:3000/hero-main/'
        //             }
        //         }
        //     })
        // }
        // return cases;