const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');

let connectedUsers = [];

let chats = [];

module.exports = function(socket) {
  console.log(socket.id, socket)
  socket.on('action', (action) => {
      if(action.type === 'server/get-cases'){
        console.log('Got hello data!', action.data);
        socket.emit('action', {type:'AVAILABLE_CASES', data:getCases()});
      } else if (action.type == 'server/user-connected') {
        user.socketId = socket.id;
        connectedUsers.push(user)
        socket.emit('action', {type: 'USER_CONNECTED', users: connectedUsers, freeCases: getCases()})
        if(user.role === 'hero') {
          socket.to(socket.id).emit('action', {type: 'ACTIVE_ACSES', activeCases: getHeroActiveCases(user)})
        } else {
          socket.to(socket.id).emit('action', {type: 'ACTIVE_ACSES', activeCases: getNeederActiveCases(user)})
        }
      } else if (action.type)
    });
}

const getCases = () => {
    ActiveCase.find({heroId: null})
    .exec()
    .then(results => {
        const response = {
            count: results.length,
            activeCases: results.map(result => {
                return {
                    _id: result._id,
                    description: result.description,
                    done: result.done,
                    neederId: result.neederId,
                    heroId: result.heroId
                }
            })
        }
        return response;
    })
    .catch(err => {
        console.log(err);
    });
}

const getHeroActiveCases = ({id}) => {
  ActiveCase.find({heroId: id})
    .exec()
    .then(results => {
        const cases = {
            activeCases: results.map(result => {
                return {
                    _id: result._id,
                    description: result.description,
                    neederId: result.neederId,
                    heroId: result.heroId,
                    done: result.done,
                    request: {
                        type: 'GET',
                        message: 'The link to see all available cases',
                        url: 'http://localhost:3000/hero-main/'
                    }
                }
            })
        }
        return cases;
    })
    .catch(err => {
        console.log(err)
    });
}

const getNeederActiveCases = ({id}) => {
  // TODO fetch needer cases
}