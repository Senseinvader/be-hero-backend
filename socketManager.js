const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');

let connectedUsers = [];

let chats = [];

module.exports = function(socket) {
  socket.on('action', (action) => {
      if (action.type == 'server/user-connected') {
        let user = action.user;
        user.socketId = socket.id;
        connectedUsers.push({login: user.login, role: user.role, level: user.level, socketId: user.socketId})
        emitFreeCases(socket, connectedUsers);
        if(user.role === 'hero') {
          emitHeroCases(socket, user)
        } else if (user.role === 'needer') {
          emitNeederCases(socket, user);
        }

      } else if (action.type === 'server/message-sent') {
        let message = action.message;
        message.timeStamp = new Date(Date.now());
        if(message.reciever in connectedUsers) {
          let recieverSocket = connectedUsers[message.reciever].socketId;
          socket.to(recieverSocket).emit('action', {type: 'MESSAGE_RECIEVED', message: message});
        }
        ActiveCase.findOne({_id: message.caseId})
        .exec()
        .then(activeCase => {
          activeCase.dialog.push(message);
          activeCase.save();
        })
        .then(() => {
          console.log('Reciever is offline, message was added to DB');
        })
        .catch(err => {
          console.log(err);
        });
      } 
      // else if (action.type === 'server/user-disconnected') {

      // }
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
      socket.emit('action', {type: 'ACTIVE_CASES', activeCases: cases})
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
    socket.to(socket.id).emit('action', {type: 'ACTIVE_CASES', activeCases: cases})

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