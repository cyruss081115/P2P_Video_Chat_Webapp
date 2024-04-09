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
    myPeer = new Peer(undefined, {
      host: "/",
      port: "3001",
      secure: false
    });
    // Add my video stream
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
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

function startRecording(videoStream, filePrefix) {
  const mediaRecorder = new MediaRecorder(videoStream);
  const chunks = [];
  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };
  mediaRecorder.onstop = (event) => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filePrefix}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    // Send the recorded video to all connected users
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      console.log("sending recorded video");
      socket.emit("send-recorded-video", base64data);
    };
    reader.readAsDataURL(blob);
  };
  mediaRecorder.start();
  return mediaRecorder;
}

function stopRecording(mediaRecorder) {
  mediaRecorder.stop();
}

const myVideoOperationsButtonContainer = document.getElementById(
  "my-video-operation-buttons"
);

// Mute/Unmute button
const muteUnmuteButton = document.createElement("button");
muteUnmuteButton.className = "btn btn-danger";
muteUnmuteButton.innerHTML = "Mute";
muteUnmuteButton.onclick = () => {
  const enabled = myVideo.srcObject.getAudioTracks()[0].enabled;
  myVideo.srcObject.getAudioTracks()[0].enabled = !enabled;
  muteUnmuteButton.innerHTML = enabled ? "Unmute" : "Mute";
  muteUnmuteButton.className = enabled ? "btn btn-primary" : "btn btn-danger";
};
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
};
myVideoOperationsButtonContainer.appendChild(playStopButton);

// Start/Stop recording button
const startStopRecordingButton = document.createElement("button");
startStopRecordingButton.className = "btn btn-primary";
startStopRecordingButton.innerHTML = "Start Recording";
let mediaRecorderList = [];
startStopRecordingButton.onclick = () => {
  if (startStopRecordingButton.innerHTML === "Start Recording") {
    mediaRecorderList.push(startRecording(myVideo.srcObject, "my-video"));
    let counter = 0;
    for (let i = 0; i < videoGrid.childNodes.length; i++) {
      const video = videoGrid.childNodes[i];
      mediaRecorderList.push(
        startRecording(video.srcObject, `user-${counter}`)
      );
      counter++;
    }
    startStopRecordingButton.innerHTML = "Stop Recording";
    startStopRecordingButton.className = "btn btn-danger";
  } else {
    mediaRecorderList.forEach((mediaRecorder) => stopRecording(mediaRecorder));
    startStopRecordingButton.innerHTML = "Start Recording";
    startStopRecordingButton.className = "btn btn-primary";
  }
};
myVideoOperationsButtonContainer.appendChild(startStopRecordingButton);

socket.on("send-recorded-video", (base64data) => {
  console.log("received recorded video");
  const blob = new Blob([base64data], { type: "video/webm" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filePrefix}.webm`;
  a.click();
  URL.revokeObjectURL(url);
});