const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');
const mongoose = require('mongoose');

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
        (user.role === 'hero') ?
          emitHeroCases(socket, user) :
          emitNeederCases(socket, user);

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

      } else if (action.type === 'server/case-created') {
        const user = action.message.user;
        const description = action.message.description;
        const activeCase = new ActiveCase({
          _id: new mongoose.Types.ObjectId(),
          neederId: user._id,
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
        })
        .catch(err => console.log(err));

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

const disconnectUser = (socket) => {
  if(socket.user) {
    console.log('all ', connectedUsers)
    connectedUsers = removeUser(connectedUsers, socket.user.id);
    io.emit('action', {type: 'USER_DISCONNECTED', users: connectedUsers});
    console.log('disconnected ', connectedUsers)
  }
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