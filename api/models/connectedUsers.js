function ConnectedUsers() {
    this.connectedUsersList = [];

    this.addUser = function(user, socketId) {
        user.socketId = socketId;
        this.connectedUsersList.push(user);
    }

    this.getByUserId = function(userId) {
        return this.connectedUsersList.find((user) => user.id === userId);
    }

    this.getBySocketId = function(socketId) {
        return this.connectedUsersList.find((user) => user.socketId === socketId);
    }

    this.removeByUserId = function(userId) {
        this.connectedUsersList = connectedUsersList.filter(user => user.id !== userId);
    }

    this.getConnectedUserList = function() {
        return this.connectedUsersList;
    }
}

module.exports = ConnectedUsers;