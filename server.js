const http = require('http');
const app = require('./app');
const socketIo = require('socket.io');


const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = module.exports.io = socketIo(server);
const socketManager = require('./socketManager');

io.on('connection', socketManager);

server.listen(port);