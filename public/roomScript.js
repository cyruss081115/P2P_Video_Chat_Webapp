const socket = io(`/`);
const videoGrid = document.getElementById("video-grid");
const SERVER_URL = "https://" + window.location.host;

let myPeer = null;
const myVideoContainer = document.getElementById("my-video-container");
let myVideo;
let peers = {};

//# region Peer Connection
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
      socket.emit("join-room", ROOM_ID, USERNAME, id);
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
    mediaRecorderList.push(signalStartRecording(myVideo.srcObject, `user-${USERNAME}-video`));
    videoGrid.childNodes.forEach((videoComponent) => {
      const video = videoComponent.getElementsByTagName("video")[0];
      mediaRecorderList.push(signalStartRecording(video.srcObject, `${video.id}`));
    });
    startStopRecordingButton.innerHTML = "Stop Recording";
    startStopRecordingButton.className = "btn btn-danger";
  } else {
    mediaRecorderList.forEach((mediaRecorder) =>
      signalStopRecording(mediaRecorder)
    );
    mediaRecorderList = [];
    startStopRecordingButton.innerHTML = "Start Recording";
    startStopRecordingButton.className = "btn btn-primary";
  }
};

// TODO: Implement the logics of chatroom
// TODO: Get user's name when loading this page
