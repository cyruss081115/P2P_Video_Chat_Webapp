const socket = io(`/`);
const videoGrid = document.getElementById("video-grid");
const SERVER_URL = "https://" + window.location.host;

let myPeer = null;
const myVideoContainer = document.getElementById("my-video-container");
const myUsername = "User";
let myVideo;
let peers = {};

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
      createUserVideoComponent(myUsername, stream, color='dark')
    )
    myVideo = document.getElementById(`user-${myUsername}-video`);

    myPeer.on("open", (id) => {
      socket.emit("join-room", ROOM_ID, id);
    });
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("new user connected", userId);
      connectToNewUser(userId, stream);
    });
  })
  .catch((error) => {
    console.log("Error: ", error);
  });

socket.on("user-disconnected", (userId) => {
  console.log("user disconnected", userId);
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
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
  const headerContainer = document.getElementById('header-container');
  const popUpComponent = createPopUpComponent(
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
  headerContainer.insertBefore(popUpComponent, headerContainer.firstChild);
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
const startStopRecordingButton = document.getElementById("start-stop-recording-button");
let mediaRecorderList = [];
startStopRecordingButton.onclick = () => {
  if (startStopRecordingButton.innerHTML === "Start Recording") {
    mediaRecorderList.push(signalStartRecording(myVideo.srcObject, "my-video"));
    let counter = 0;
    for (let i = 0; i < videoGrid.childNodes.length; i++) {
      const video = videoGrid.childNodes[i];
      mediaRecorderList.push(
        signalStartRecording(video.srcObject, `user-${counter}`)
      );
      counter++;
    }
    startStopRecordingButton.innerHTML = "Stop Recording";
    startStopRecordingButton.className = "btn btn-danger";
  } else {
    mediaRecorderList.forEach((mediaRecorder) => signalStopRecording(mediaRecorder));
    mediaRecorderList = [];
    startStopRecordingButton.innerHTML = "Start Recording";
    startStopRecordingButton.className = "btn btn-primary";
  }
};