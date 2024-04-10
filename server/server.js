const express = require('express');
const app = express();

const cors = require('cors');

const corsOptions = {
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
};

app.use(cors(corsOptions));

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: corsOptions,
});


const { v4 } = require('uuid');

const { PORT } = require('./config');


const roomList = [];

app.get('/roomList', (req, res) => {
  res.json(roomList);
});


io.on('connection', (socket) => {
    socket.on('create-room', () => {
        const newRoomId = v4();
        const newRoom = {
          id: newRoomId,
          socketList: [],
        };
        roomList.push(newRoom);
        io.emit('update-room', roomList);
    });

    socket.on('join-room', (roomId) => {
      const targetRoom = roomList.find((room) => room.id === roomId);
      if (targetRoom) {
        targetRoom.socketList.push(socket.id);
        socket.join(roomId);
        io.to(roomId).emit('update-room', roomList);
      }
    });

    socket.on('server-forwardAudioData', (data) => {
      console.log(data.length);
      const roomId = roomList.find(room => room.socketList.includes(socket.id))?.id;

      socket.broadcast.to(roomId).emit('client-receiveAudioData', data);  //send data to all client except my client
      //io.to(roomId).emit('client-receiveAudioData', data);  //send data to all client in the room
    });
});


server.listen(PORT, () => {
    console.log(`server is on at port ${PORT}`);
});