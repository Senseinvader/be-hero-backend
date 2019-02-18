const http = require('http');
const app = require('./app');
const socketIo = require('socket.io');


const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = module.exports.io = socketIo(server);
const socketManager = require('./socketManager');

io.on('connection', socketManager => {
  console.log('Do some stuff');
  //  Doing things using socket object and emit method (like emitting new messages)
  socket.on('disconnect', () => console.log('Client disconnetcted'))
});

server.listen(port);