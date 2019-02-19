const io = require('./server').io;
const ActiveCase = require('./api/models/activeCase');

let connectedUsers = [];

module.exports = function(socket) {
    console.log(socket.id, socket)
    socket.on('action', (action) => {
        if(action.type === 'server/hello'){
          console.log('Got hello data!', action.data);
          socket.emit('action', {type:'message', data:'good day!'});
        }
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