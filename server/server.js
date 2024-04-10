const express = require("express");
const app = express();

const cors = require("cors");

const multer = require("multer")
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path")

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

app.use(cors(corsOptions));

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: corsOptions,
});

const { v4 } = require("uuid");

const { PORT } = require("./config");

let roomList = [];

app.get("/roomList", (req, res) => {
  res.json(roomList);
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "uploads", filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.sendStatus(404);
    }
  });
});


io.on("connection", (socket) => {
  socket.on("create-room", () => {
    const newRoomId = v4();
    const newRoom = {
      id: newRoomId,
      socketList: [],
      userIdList: [],
    };
    roomList.push(newRoom);
    io.emit("update-room", roomList);
  });

  // socket.on('join-room', (roomId, userId) => {
  //   console.log('join-room', roomId, userId);
  //   const targetRoom = roomList.find((room) => room.id === roomId);
  //   console.log('targetRoom', targetRoom);
  //   if (targetRoom){
  //     targetRoom.socketList.push(socket.id);
  //     socket.join(roomId);
  //     io.to(roomId).emit('update-room', roomList);
  //     // Broadcast to all clients in the room
  //     socket.broadcast.to(roomId).emit('user-connected', userId);

  //     socket.on('disconnect', () => {
  //       targetRoom.socketList = targetRoom.socketList.filter((socketId) => socketId !== socket.id);
  //       io.to(roomId).emit('update-room', roomList);
  //       socket.broadcast.to(roomId).emit('user-disconnected',userId);
  //     });
  //   }
  // });

  app.post("/uploads", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const newFilePath = filePath + ".webm";

    fs.renameSync(filePath, newFilePath);

    io.emit("fileUploaded", { fileUrl: `http://localhost:2000/${newFilePath}` });

    return res.status(200).json({ fileUrl: `http://localhost:2000/${newFilePath}` });
  });


  socket.on("join-room", (roomId, userId) => {
    console.log("join-room", roomId, userId);
    // Check if room exists
    const targetRoom = roomList.find((room) => room.id === roomId);
    if (!targetRoom) {
      console.log(`Room ${roomId} not found`);
      return;
    }
    // Check if user already joined the room
    if (!userId) {
      console.log("undefined userId", userId);
      return;
    }
    if (targetRoom.userIdList.includes(userId)) {
      console.log(`User ${userId} already joined room ${roomId}`);
      return;
    }
    targetRoom.userIdList.push(userId);
    socket.join(roomId);
    // Broadcast to all clients in the room
    console.log("broadcast user-connected");
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      targetRoom.userIdList = targetRoom.userIdList.filter(
        (id) => id !== userId
      );
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("remove-room", (roomId) => {
    const targetRoomIndex = roomList.findIndex((room) => room.id === roomId);
    if (targetRoomIndex !== -1) {
      roomList.splice(targetRoomIndex, 1);
      io.to(roomId).emit("update-room", roomList);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is on at port ${PORT}`);
});
