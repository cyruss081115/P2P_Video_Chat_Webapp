class RoomManager {
    constructor () {
        this._roomList = [];
    }

    createRoom (roomId) {
        const newRoom = {
            roomId: roomId,
            users: []
        }
        this._roomList.push(newRoom);
    }

    removeRoom (roomId) {
        if (this._roomList.length === 0)
            throw new Error('No rooms to remove');
        if (this._roomList.findIndex(room => room.roomId === roomId) === -1)
            throw new Error(`Room ${roomId} not found`);
        this._roomList = this._roomList.filter(room => room.roomId !== roomId);
    }

    getRoomList () {
        return this._roomList;
    }
}

module.exports = new RoomManager();