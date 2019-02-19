const io = require('./server').io;

let connectedUsers = [];

module.exports = function(socket) {
  socket.on('USER_CONNECTED', (user) => {
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;
    socket.emit('USER_CONNECTED', connectedUsers);
    console.log(connectedUsers);
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