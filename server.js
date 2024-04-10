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
app.use(express.static("public"));
app.use(express.static("uploads"));

// region file upload
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
    res.status(400).send("No file uploaded");
    return;
  }
  res.status(200).json({ filename: savedFileName });
});

app.get("/uploads/:filename", (req, res) => {
  const fileName = req.params.filename;
  if (fs.existsSync(__dirname + `/uploads/${fileName}`) === false) {
    res.status(404).send("File not found");
    return;
  }
  res.sendFile(__dirname + `/uploads/${fileName}`);
});

app.delete("/uploads/:filename", (req, res) => {
  const fileName = req.params.filename;
  fs.unlink(__dirname + `/uploads/${fileName}`, (err) => {
    if (err) {
      res.status(400).send("Error deleting file");
    } else {
      res.send("File deleted successfully");
    }
  });
});

// endregion

// region Room Manager
const roomManager = require("./roomManager");

app.get("/roomOps/roomList", (req, res) => {
  res.json(roomManager.getRoomList());
});

app.post("/roomOps/createRoom", (req, res) => {
  const roomId = uuidV4();
  roomManager.createRoom(roomId);
  res.json({ roomId });
});

app.delete("/roomOps/removeRoom/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  if (roomId === undefined) res.status(400).send("Room ID not provided");
  try {
    roomManager.removeRoom(roomId);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// endregion

// region html routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/:room", (req, res) => {
  const roomId = req.params.room;
  if (!roomManager.roomExists(roomId)) {
    res.redirect("/");
    return;
  }
  res.render("room", { roomId: req.params.room });
});
// endregion

// region socket.io
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
// endregion
server.listen(3000);
