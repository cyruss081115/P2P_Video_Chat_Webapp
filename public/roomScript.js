const socket = io(`/`);
const videoGrid = document.getElementById("video-grid");
const SERVER_URL = "https://" + window.location.host;

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
      secure: false,
    });
    // myPeer = new Peer();
    // Add my video stream
    myVideo.srcObject = stream;
    myVideo.addEventListener("loadedmetadata", () => {
      myVideo.play();
    });

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

function createPopUpElement(message, yesCallback, noCallback) {
  const popUp = document.createElement("div");
  popUp.className = "alert alert-primary";

  const contentContainer = document.createElement("div");
  contentContainer.className = "d-flex justify-content-between align-items-baseline";

  const messageElement = document.createElement("p");
  messageElement.innerHTML = message;
  popUp.appendChild(messageElement);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex justify-content-around gap-2";

  const yesButton = document.createElement("button");
  yesButton.className = "btn btn-primary";
  yesButton.innerHTML = "Yes";
  yesButton.onclick = () => {
    yesCallback();
    popUp.remove();
  };

  const noButton = document.createElement("button");
  noButton.className = "btn btn-danger";
  noButton.innerHTML = "No";
  noButton.onclick = () => {
    noCallback();
    popUp.remove();
  };

  buttonContainer.appendChild(yesButton);
  buttonContainer.appendChild(noButton);

  contentContainer.appendChild(messageElement);
  contentContainer.appendChild(buttonContainer);

  popUp.appendChild(contentContainer);

  return popUp;
}

function startRecording(videoStream, filePrefix) {
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
  // Download the file from server
  const yesCallback = () => {
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
    xmlHttp.open("GET", `${SERVER_URL}/uploads/${filename}`, true); // true for asynchronous
    xmlHttp.send(null);
  };
  const noCallback = () => {
    console.log("no callback");
  };
  const headerContainer = document.getElementById('header-container');
  headerContainer.insertBefore(
    createPopUpElement(
      `Download ${filename}?`, yesCallback, noCallback
    ), headerContainer.firstChild
  );
});

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
