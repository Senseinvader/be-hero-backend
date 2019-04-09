function ConnectedUsers() {
    this.connectedUsersList = [];

    this.addUser = function(user, socketId) {
        user.socketId = socketId;
        this.connectedUsersList.push(user);
        console.log(this.connectedUsersList)
    }

    this.getByUserId = function(userId) {
        return this.connectedUsersList.find((user) => user.id === userId);
    }

    this.getBySocketId = function(socketId) {
        return this.connectedUsersList.find((user) => user.socketId === socketId);
    }

    this.removeByUserId = function(userId) {
        this.connectedUsersList = this.connectedUsersList.filter(user => user.id !== userId);
    }

    this.removeBySocketId = function(socketId) {
        this.connectedUsersList = this.connectedUsersList.filter(user => user.socketId !== socketId);
    }

    this.getConnectedUserList = function() {
        return this.connectedUsersList;
    }
}

module.exports = ConnectedUsers;