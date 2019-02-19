const createUser = ({name = '', socketId = null}) => (
  {
    name,
    socketId
  }
);

const createMessage = ({message = '', sender = '', reciever=''} = {}) => (
  {
    time: getTime(new Date(Date.now())),
    message,
    sender,
    reciever
  }
);

const createChat = ({users = [], name = 'Community', messages = []} = {}) => (
  {
    users,
    messages,
    name,
    typingUsers: []
  }
)

const getTime = (date) => {
  return `${date.getHours()}:${'0'+date.getMinutes().slice(-2)}`
}

module.exports = {
  createUser,
  createChat,
  createMessage
}