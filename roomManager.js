class Room {
  /*
  * Room class, representing a chat room
  * @param {string} roomId
  */
  constructor (roomId) {
    this._roomId = roomId;
    this._users = [];
    this._chatHistory = [];
  }

  /*
  * Get the room ID
  * @return {string} room ID
  */
  getRoomId() {
    return this._roomId;
  }

  /*
  * Get the chat history
  * @return {Array} read only chat history
  */
  getChatHistory() {
    return Array.from(this._chatHistory);
  }

  /*
  * Get the users in the room
  * @return {Array} read only users in the room
  */
  getUsers() {
    return Array.from(this._users);
  }

  /*
  * Add a user to the room
  * @param {string} userId
  * @param {string} username
  * @throws {Error} if user is already in room
  * @return {undefined}
  * @modifies this._users
  */
  addUser(userId, username) {
    const user = {
      userId: userId,
      username: username,
    }
    if (this._users.includes(user)) throw new Error(`User ${userId} already in room`);
    this._users.push(user);
  }

  /*
  * Remove a user from the room
  * @param {string} userId
  * @throws {Error} if user is not in room
  * @return {undefined}
  * @modifies this._users
  */
  removeUser(userId) {
    if (!this._users.includes(userId)) throw new Error(`User ${userId} not in room`);
    this._users = this._users.filter(user => user !== userId);
  }
  
  /*
  * Add a chat message to the room
  * @param {string} userId
  * @param {string} message
  * @return {undefined}
  * @modifies this._chatHistory
  */
  addChatMessage(userId, message) {
    this._chatHistory.push({
      userId: userId,
      message: message,
    });
  }

  /*
  * Remove a chat message from the room
  * @param {number} messageIndex
  * @throws {Error} if message index is invalid
  * @return {undefined}
  * @modifies this._chatHistory
  */
  removeChatMessage(messageIndex) {
    if (messageIndex < 0 || messageIndex >= this._chatHistory.length) throw new Error("Invalid message index");
    this._chatHistory.splice(messageIndex, 1);
  }

  toJSON() {
    return {
      roomId: this._roomId,
      users: this._users,
      chatHistory: this._chatHistory,
    };
  }
}

class RoomManager {
  constructor() {
    this._roomList = [];
  }

  createRoom(roomId) {
    const newRoom = new Room(roomId);
    this._roomList.push(newRoom);
  }

  removeRoom(roomId) {
    if (this._roomList.length === 0) throw new Error("No rooms to remove");
    if (!this.roomExists(roomId))
      throw new Error(`Room ${roomId} not found`);
    this._roomList = this._roomList.filter((room) => room.getRoomId() !== roomId);
  }

  roomExists(roomId) {
    return this.getRoom(roomId) !== undefined;
  }

  joinRoom(roomId, userId, username) {
    const room = this.getRoom(roomId);
    room.addUser(userId, username);
  }

  leaveRoom(roomId, userId) {
    const room = this.getRoom(roomId);
    if (room === undefined) throw new Error(`Room ${roomId} not found`);
    room.removeUser(userId);
  }

  // Returns read only list of rooms
  getRoomList() {
    return Array.from(this._roomList);
  }

  // Returns a reference to the room object
  /*
  * Get a room object
  * @param {string} roomId
  * @return {Room} room object
  */
  getRoom(roomId) {
    return this._roomList.find((room) => room.getRoomId() === roomId);
  }
}

module.exports = new RoomManager();
