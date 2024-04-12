const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("certificates/key.pem"),
  cert: fs.readFileSync("certificates/cert.pem"),
};
const server = https.createServer(options, app);

const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("uploads"));

//#region file upload

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  // Specify the upload directory
  cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
  // Define the file name format
  cb(null, file.originalname);
  }
 });
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const savedFileName = req.file.originalname;
  if (req.file === undefined) {
    return res.status(400).send("No file uploaded");
  }
  return res.status(200).json({ filename: savedFileName });
});

app.get("/uploads/:filename", (req, res) => {
  const fileName = req.params.filename;
  if (fs.existsSync(__dirname + `/uploads/${fileName}`) === false) {
    return res.status(404).send("File not found");
  }
  return res.sendFile(__dirname + `/uploads/${fileName}`);
});

app.delete("/uploads/:filename", (req, res) => {
  const fileName = req.params.filename;
  fs.unlink(__dirname + `/uploads/${fileName}`, (err) => {
    if (err) {
      return res.status(400).send("Error deleting file");
    } else {
      return res.send("File deleted successfully");
    }
  });
});
//#endregion

//# region Room Manager

const roomManager = require("./roomManager");

app.get("/roomOps/roomList", (req, res) => {
  res.json(roomManager.getRoomList());
});

app.post("/roomOps/createRoom", (req, res) => {
  const roomId = uuidV4();
  roomManager.createRoom(roomId);
  return res.json({ roomId });
});

app.delete("/roomOps/removeRoom/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  if (!roomId) {
    return res.status(400).send("Room ID not provided");
  }
  try {
    roomManager.removeRoom(roomId);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.get("/roomOps/room/:roomId/getChatHistory", (req, res) => {
  const roomId = req.params.roomId;
  if (!roomId) {
    return res.status(400).send("Room ID not provided");
  }
  try {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return res.status(400).send("Room not found");
    }
    const chatHistory = room.getChatHistory();
    return res.json(chatHistory);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.post("/roomOps/room/:roomId/addChatMessage", (req, res) => {
  const roomId = req.params.roomId;
  const message = req.body.message;
  const userId = req.body.userId;
  if (!roomId) {
    return res.status(400).send("Room ID not provided");
  }
  if (!message) {
    return res.status(400).send("Message not provided");
  }
  if (!userId) {
    return res.status(400).send("User ID not provided");
  }
  try {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return res.status(400).send("Room not found");
    }
    room.addChatMessage(userId, message);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

app.delete("/roomOps/room/:roomId/removeChatMessage", (req, res) => {
  const roomId = req.params.roomId;
  const messageIndex = req.body.messageIndex;
  if (!roomId) {
    return res.status(400).send("Room ID not provided");
  }
  if (!messageIndex) {
    return res.status(400).send("Message index not provided");
  }
  try {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      return res.status(400).send("Room not found");
    }
    room.removeChatMessage(messageIndex);
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
//#endregion

//#region html routes

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:room", (req, res) => {
  const roomId = req.params.room;
  if (!roomManager.roomExists(roomId)) {
    return res.redirect("/");
  }
  res.render("room", { roomId: req.params.room });
});
//#endregion

//#region socket.io
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log("user connected to room", roomId, userId);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    roomManager.joinRoom(roomId, userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
      roomManager.leaveRoom(roomId, userId);
    });

    socket.on("file-uploaded-to-room", (filename, roomId) => {
      console.log("server received file-uploaded event");
      io.to(roomId).emit("file-uploaded", filename);
    });
  });
});
//#endregion

server.listen(3000);
