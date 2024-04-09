const socket = io(`/`);
const videoGrid = document.getElementById("video-grid");

let myPeer = null;
const myVideo = document.getElementById("my-video");
myVideo.muted = true;
let peers = {};


navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myPeer = new Peer();
    // Add my video stream
    myVideo.srcObject = stream;
    myVideo.addEventListener('loadedmetadata', () => {
      myVideo.play();
    });

    // addVideoStream(myVideo, stream);
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


const myVideoOperationsButtonContainer = document.getElementById("my-video-operation-buttons");

// Mute/Unmute button
const muteUnmuteButton = document.createElement("button");
muteUnmuteButton.className = "btn btn-danger";
muteUnmuteButton.innerHTML = "Mute";
muteUnmuteButton.onclick = () => {
  const enabled = myVideo.srcObject.getAudioTracks()[0].enabled;
  myVideo.srcObject.getAudioTracks()[0].enabled = !enabled;
  muteUnmuteButton.innerHTML = enabled ? "Unmute" : "Mute";
  muteUnmuteButton.className = enabled ? "btn btn-primary" : "btn btn-danger";
}
myVideoOperationsButtonContainer.appendChild(muteUnmuteButton);

// Play/Stop button
const playStopButton = document.createElement("button");
playStopButton.className = "btn btn-danger";
playStopButton.innerHTML = "Stop";
playStopButton.onclick = () => {
  const enabled = myVideo.srcObject.getVideoTracks()[0].enabled;
  myVideo.srcObject.getVideoTracks()[0].enabled = !enabled;
  playStopButton.innerHTML = enabled ? "Play" : "Stop";
  playStopButton.className = enabled ? "btn btn-primary" : "btn btn-danger";
}
myVideoOperationsButtonContainer.appendChild(playStopButton);