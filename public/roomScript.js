const socket = io(`/`);
const videoGrid = document.getElementById("video-grid");
const SERVER_URL = "https://" + window.location.host;

let myPeer = null;
const myVideoContainer = document.getElementById("my-video-container");
let myVideo;
let peers = {};

let myUserID = null;

//#region Peer Connection
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // Uncomment the following line to use the default PeerJS server
    // myPeer = new Peer();
    myPeer = new Peer(undefined, {
      host: "/",
      port: "3001",
      secure: false,
    });
    // Add my video stream
    myVideoContainer.appendChild(
      createUserVideoComponent(USERNAME, stream, (color = "dark"))
    );
    myVideo = document.getElementById(`user-${USERNAME}-video`);

    myPeer.on("open", (id) => {
      myUserID = id;
      socket.emit("join-room", ROOM_ID, USERNAME, myUserID);
    });
    myPeer.on("call", (call) => {
      call.answer(stream);
      const peerUserId = call.peer;
      const xmlHttp = new XMLHttpRequest();
      console.log("peerUserId", peerUserId);
      xmlHttp.onreadystatechange = () => {
        if (
          xmlHttp.readyState == 4 &&
          xmlHttp.status == 200 &&
          xmlHttp.responseText
        ) {
          const users = JSON.parse(xmlHttp.responseText);
          const username = users.find(
            (user) => user.userId === peerUserId
          ).username;
          console.log(`new user ${username} connected to room ${ROOM_ID}`);
          let newUserVideo = null;
          call.on("stream", (userVideoStream) => {
            if (!peers[peerUserId]) {
              newUserVideo = createUserVideoComponent(
                username,
                userVideoStream,
                "secondary"
              );
              console.log("Initial newUserVideo", newUserVideo);
              videoGrid.appendChild(newUserVideo);

              peers[peerUserId] = call;
            }
          });
          call.on("close", () => {
            newUserVideo.remove();
          });
        }
      };
      xmlHttp.open(
        "GET",
        `${SERVER_URL}/roomOps/room/${ROOM_ID}/getUsers`,
        false
      );
      xmlHttp.send(null);
    });

    socket.on("user-connected", (userId, username) => {
      console.log("new user connected", userId, username);
      connectToNewUser(userId, username, stream);
    });
  })
  .catch((error) => {
    console.log("Error: ", error);
  });

socket.on("user-disconnected", (userId) => {
  console.log("user disconnected", userId);
  if (peers[userId]) peers[userId].close();
});
//#endregion

function connectToNewUser(userId, username, stream) {
  const call = myPeer.call(userId, stream);
  let newUserVideo = null;
  call.on("stream", (userVideoStream) => {
    if (!peers[userId]) {
      newUserVideo = createUserVideoComponent(
        username,
        userVideoStream,
        "secondary"
      );
      videoGrid.appendChild(newUserVideo);

      peers[userId] = call;
    }
  });
  call.on("close", () => {
    if (peers[userId]) {
      newUserVideo.remove();
    }
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

// Recording
function signalStartRecording(videoStream, filePrefix) {
  const mediaRecorder = new MediaRecorder(videoStream);
  const chunks = [];
  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };
  mediaRecorder.onstop = (event) => {
    // Create a blob from the chunks
    const blob = new Blob(chunks, { type: "video/webm" });
    // Upload to server
    const xmlHttp = new XMLHttpRequest();
    const filename = `${filePrefix}-${new Date().toISOString()}.webm`;
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        console.log(`video of name ${filename} uploaded`);
        socket.emit("file-uploaded-to-room", filename, ROOM_ID);
      }
    };
    xmlHttp.open("POST", `${SERVER_URL}/upload`, true); // true for asynchronous
    const formData = new FormData();
    formData.append("file", blob, filename);
    xmlHttp.send(formData);
  };
  mediaRecorder.start();
  return mediaRecorder;
}

socket.on("file-uploaded", (filename) => {
  const headerContainer = document.getElementById("header-container");
  const popUpBanner = createPopUpBannerComponent(
    // Define pop-up message
    `Download ${filename}?`,
    // Define yes callback
    () => {
      // Request and download file from server
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
          const url = URL.createObjectURL(xmlHttp.response);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      };
      xmlHttp.responseType = "blob";
      xmlHttp.open("GET", `${SERVER_URL}/uploads/${filename}`, true);
      xmlHttp.send(null);
    },
    // Empty no callback
    () => {}
  );
  headerContainer.insertBefore(popUpBanner, headerContainer.firstChild);
});

function signalStopRecording(mediaRecorder) {
  mediaRecorder.stop();
}

// Mute/Unmute button
const muteUnmuteButton = document.getElementById("mute-unmute-button");
muteUnmuteButton.onclick = () => {
  const enabled = myVideo.srcObject.getAudioTracks()[0].enabled;
  myVideo.srcObject.getAudioTracks()[0].enabled = !enabled;
  muteUnmuteButton.innerHTML = enabled ? "Unmute" : "Mute";
  muteUnmuteButton.className = enabled ? "btn btn-primary" : "btn btn-danger";
};

// Play/Stop button
const playStopButton = document.getElementById("play-stop-button");
playStopButton.onclick = () => {
  const enabled = myVideo.srcObject.getVideoTracks()[0].enabled;
  myVideo.srcObject.getVideoTracks()[0].enabled = !enabled;
  playStopButton.innerHTML = enabled ? "Play" : "Stop";
  playStopButton.className = enabled ? "btn btn-primary" : "btn btn-danger";
};

// Start/Stop recording button
const startStopRecordingButton = document.getElementById(
  "start-stop-recording-button"
);
let mediaRecorderList = [];
startStopRecordingButton.onclick = () => {
  if (startStopRecordingButton.innerHTML === "Start Recording") {
    // Send signal to start recording for all videos
    mediaRecorderList.push(signalStartRecording(myVideo.srcObject, `user-${USERNAME}-video`));
    videoGrid.childNodes.forEach((videoComponent) => {
      const video = videoComponent.getElementsByTagName("video")[0];
      mediaRecorderList.push(signalStartRecording(video.srcObject, `${video.id}`));
    });
    startStopRecordingButton.innerHTML = "Stop Recording";
    startStopRecordingButton.className = "btn btn-danger";
  } else {
    // Send signal to stop recording for all videos
    mediaRecorderList.forEach((mediaRecorder) =>
      signalStopRecording(mediaRecorder)
    );
    mediaRecorderList = [];
    startStopRecordingButton.innerHTML = "Start Recording";
    startStopRecordingButton.className = "btn btn-primary";
  }
};

//#region Chat modal
// Open chat button
const chatModalId = "chatRoomModal";
const openChatButton = document.getElementById("open-chat-button");
openChatButton.setAttribute("data-bs-toggle", "modal");
openChatButton.setAttribute("data-bs-target", `#${chatModalId}`);

const modalContainer = document.getElementById("modal-container");

const chatMessageContainerId = "chat-message-container";
const chatRoomModal = createChatRoomModalComponent(
  chatModalId,
  chatMessageContainerId,
  // Send message callback
  (message) => {
    // Send message to server
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        socket.emit("chat-message-updated", ROOM_ID);
      }
    };
    xmlHttp.open("POST", `${SERVER_URL}/roomOps/room/${ROOM_ID}/addChatMessage`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlHttp.send(JSON.stringify({ userId: myUserID, message }));
  },
  // Define close callback
  () => {}
);

modalContainer.appendChild(chatRoomModal);

// Update chat messages
const updateChatMessageContainer = (chatMessages) => {
  const chatMessageContainer = document.getElementById(chatMessageContainerId);
  chatMessageContainer.innerHTML = "";
  chatMessages.forEach((chatMessage) => {
    const username = chatMessage.user.username;
    const message = chatMessage.message;
    chatMessageContainer.appendChild(createChatBubbleComponent(username, message));
  });
};

const updateChatMessages = (roomId) => {
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
      const chatMessages = JSON.parse(xmlHttp.responseText);
      updateChatMessageContainer(chatMessages);
    }
  };
  xmlHttp.open("GET", `${SERVER_URL}/roomOps/room/${roomId}/getChatHistory`, true);
  xmlHttp.send(null);
};

socket.on("chat-message-updated", (roomId) => {
  updateChatMessages(roomId);
});
//#endregion

// Update chat messages on load
updateChatMessages(ROOM_ID);

// Karaoke- vocie remover
function karaoke(evt) {
  var inputL = evt.inputBuffer.getChannelData(0),
    inputR = evt.inputBuffer.getChannelData(1),
    output = evt.outputBuffer.getChannelData(0),
    len = inputL.length,
    i = 0;
  for (; i < len; i++) {
    output[i] = inputL[i] - inputR[i];
  }
}
// handle karaoke input file
document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('audioFileInput');
  var audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.style.display = 'none'; 

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    var fileURL = URL.createObjectURL(file);

    audioPlayer.src = fileURL;
    audioPlayer.addEventListener('loadedmetadata', function () {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      var audioContext = new AudioContext();
      var sourceNode = audioContext.createMediaElementSource(audioPlayer);
      var scriptNode = audioContext.createScriptProcessor(4096, 2, 2);
      scriptNode.onaudioprocess = karaoke;
      sourceNode.connect(scriptNode);
      scriptNode.connect(audioContext.destination);
      audioPlayer.style.display = 'block'; 
    });
  });
});