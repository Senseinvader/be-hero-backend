const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');

let connectedUsers = [];

let chats = [];

module.exports = function(socket) {
  socket.on('action', (action) => {
      if(action.type === 'server/get-cases'){
        console.log('Got hello data!', action.data);
        socket.emit('action', {type:'AVAILABLE_CASES', data:getCases()});
      } else if (action.type == 'server/user-connected') {
        let user = action.user;
        user.socketId = socket.id;
        connectedUsers.push({login: user.login, role: user.role, level: user.level})
        socket.emit('action', {type: 'USER_CONNECTED', users: connectedUsers, freeCases: getCases()})
        if(user.role === 'hero') {
          socket.to(socket.id).emit('action', {type: 'ACTIVE_ACCESS', activeCases: getHeroActiveCases(user)})
        } else if (user.role === 'needer') {
          socket.to(socket.id).emit('action', {type: 'ACTIVE_ACCESS', activeCases: getNeederActiveCases(user)})
        }
      }
    });
}

const getCases = () => {
    ActiveCase.find({heroId: null})
    .exec()
    .then(results => {
      createCasesArray(results);
        // const response = {
        //     count: results.length,
        //     activeCases: results.map(result => {
        //         return {
        //             _id: result._id,
        //             description: result.description,
        //             done: result.done,
        //             neederId: result.neederId,
        //             heroId: result.heroId,
        //             dialog: result.dialog
        //         }
        //     })
        // }
        // return response;
    })
    .catch(err => {
        console.log(err);
    });
}

const getHeroActiveCases = ({id}) => {
  ActiveCase.find({heroId: id})
    .exec()
    .then(results => {
      createCasesArray(results);
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
    })
    .catch(err => {
        console.log(err)
    });
}

const getNeederActiveCases = ({id}) => {
  // TODO fetch needer cases
  ActiveCase.find({neederId: id})
  .exec()
  .then(results => {
    createCasesArray(results);
    // const cases = {
    //   activeCases: results.map(result => {
    //     return {
    //       _id: result.id,
    //       description: result.description,
    //       neederId: result.neederId,
    //       heroId: result.heroId,
    //       done: result.done,
    //       dialog: result.dialog
    //       request: {
    //           type: 'GET',
    //           message: 'The link to see all available cases',
    //           url: 'http://localhost:3000/hero-main/'
    //       }
    //     }
    //   })
    // }
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
  const cases = {
    activeCases: results.map(result => {
      return {
        _id: result.id,
        description: result.description,
        neederId: result.neederId,
        heroId: result.heroId,
        done: result.done,
        dialog: result.dialog
      }
    })
  }
  return cases;
}