class RoomManager {
  constructor() {
    this._roomList = [];
  }

  createRoom(roomId) {
    const newRoom = {
      roomId: roomId,
      users: [],
    };
    this._roomList.push(newRoom);
  }

  removeRoom(roomId) {
    if (this._roomList.length === 0) throw new Error("No rooms to remove");
    if (this._roomList.findIndex((room) => room.roomId === roomId) === -1)
      throw new Error(`Room ${roomId} not found`);
    this._roomList = this._roomList.filter((room) => room.roomId !== roomId);
  }

  roomExists(roomId) {
    return this._roomList.findIndex((room) => room.roomId === roomId) !== -1;
  }

  joinRoom(roomId, userId) {
    const room = this._roomList.find((room) => room.roomId === roomId);
    if (room === undefined) throw new Error(`Room ${roomId} not found`);
    room.users.push(userId);
  }

  leaveRoom(roomId, userId) {
    const room = this._roomList.find((room) => room.roomId === roomId);
    if (room === undefined) throw new Error(`Room ${roomId} not found`);
    room.users = room.users.filter((user) => user !== userId);
  }

  getRoomList() {
    return this._roomList;
  }
}

module.exports = new RoomManager();
