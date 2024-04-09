const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('certificates/key.pem'),
    cert: fs.readFileSync('certificates/cert.pem')
};
const server = https.createServer(options, app);

const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs')
app.use(express.static('public'))

const roomManager = require('./roomManager');

app.get('/roomOps/roomList', (req, res) => {
  res.json(roomManager.getRoomList());
});

app.post('/roomOps/createRoom', (req, res) => {
  const roomId = uuidV4();
  roomManager.createRoom(roomId);
  res.json({ roomId });
});

app.delete('/roomOps/removeRoom/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  if (roomId === undefined)
    res.status(400).send('Room ID not provided');
  try {
    roomManager.removeRoom(roomId);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/:room', (req, res) => {
  const roomId = req.params.room;
  if (!roomManager.roomExists(roomId)) {
    res.redirect('/');
    return;
  }
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
    roomManager.joinRoom(roomId, userId);

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
      roomManager.leaveRoom(roomId, userId);
    })
  })
})

server.listen(3000)