import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import { io } from "socket.io-client";
import {Typography, Button} from "@mui/material";

const ChatRoom = () => {
  const { roomId } = useParams();
  const videoGridRef = useRef();
  const peersRef = useRef({});
  const myPeerRef = useRef();
  const myVideoRef = useRef();

  const [ playStopMyVideoState, setPlayStopMyVideoState ] = useState(true);
  const [ muteUnmuteMyAudioState, setMuteUnmuteMyAudioState ] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const mediaRecorderRef = useRef(null);

  const socket = io("http://localhost:2000");
  socket.on("fileUploaded", (data) => {
    const { fileUrl } = data;
    alert("Someone recorded! File URL: " + fileUrl); // Tell all the user where is the file
  });

  useEffect(() => {
    const mediaDevicesSettings = {
      video: { width: 250, height: 250 },
      audio: { echoCancellation: true, noiseSuppression: true },
    };
    videoGridRef.current = document.getElementById("video-grid");
    myPeerRef.current = new Peer();

    navigator.mediaDevices
      .getUserMedia(mediaDevicesSettings)
      .then((stream) => {
        myVideoRef.current = document.getElementById("myVideo");
        console.log("myVideoRef", myVideoRef.current);
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.addEventListener("loadedmetadata", () => {
          myVideoRef.current.play();
        });

        myPeerRef.current.on("open", (userId) => {
          socket.emit("join-room", roomId, userId);
        });
        myPeerRef.current.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            console.log("add call stream")
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
      if (peersRef.current[userId]) peersRef.current[userId].close();
    });

    return () => {
      myPeerRef.current.destroy();
      Object.values(peersRef.current).forEach(call => {
        call.close();
      });
      socket.off("user-disconnected");
      socket.off("user-connected");
    }
  }, []);

  const connectToNewUser = (userId, stream) => {
    console.log("Receiving userId: ", userId);
    console.log("My Peer Ref: ", myPeerRef.current);
    const call = myPeerRef.current.call(userId, stream);
    console.log(call);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      console.log("streaming");
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    peersRef.current[userId] = call;
  };

  const addVideoStream = (video, stream) => {
    console.log("Adding video stream");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGridRef.current.appendChild(video);
  };

  const muteUnmuteMyAudio = () => {
    const enabled = myVideoRef.current.srcObject.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoRef.current.srcObject.getAudioTracks()[0].enabled = false;
      setMuteUnmuteMyAudioState(false);
    } else {
      myVideoRef.current.srcObject.getAudioTracks()[0].enabled = true;
      setMuteUnmuteMyAudioState(true);
    }
  };

  const playStopMyVideo = () => {
    const enabled = myVideoRef.current.srcObject.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoRef.current.srcObject.getVideoTracks()[0].enabled = false;
      setPlayStopMyVideoState(false);
    } else {
      myVideoRef.current.srcObject.getVideoTracks()[0].enabled = true;
      setPlayStopMyVideoState(true);
    }
  }

  const handleRecord = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setVideoStream(stream);
  
      const options = { mimeType: "video/webm; codecs=vp9,opus" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
  
      const recordedChunks = [];
      mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
  
        const formData = new FormData();
        formData.append("file", recordedBlob, "chat_recording.webm");
  
        try {
          const response = await fetch("http://localhost:2000/uploads", {
            method: "POST",
            body: formData,
          });
  
          if (response.ok) {
            console.log("File uploaded successfully!");
          } else {
            console.error("File upload failed!");
          }
        } catch (error) {
          console.error("An error occurred during file upload:", error);
        }
  
        recordedChunks.length = 0;
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } else {
      // Stop recording
      mediaRecorderRef.current.stop();
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setIsRecording(false);
    }
  };

  return (
    <>
      <Typography variant="h2">Chat Room</Typography>
      <Typography variant="h4">Room ID: {roomId} </Typography>
      <div>
        <div>
          <Typography variant="h6">My Video</Typography>
          <video id="myVideo" ref={myVideoRef} muted></video>
          <div style={{display: "flex", justifyContent: "center"}}>
            <Button onClick={muteUnmuteMyAudio} variant="outlined" color="warning" sx={{ textTransform: 'lowercase' }}>
              {muteUnmuteMyAudioState ? "Mute Audio" : "Unmute Audio"}
            </Button>
            <div style={{margin: "0 10px"}}/>
            <Button onClick={playStopMyVideo} variant="outlined" color="warning" sx={{ textTransform: 'lowercase' }}>
              {playStopMyVideoState ? "Stop Video" : "Play Video"}
            </Button>
            <div style={{margin: "0 10px"}}/>
            <Button onClick={handleRecord} variant="outlined" color="warning" sx={{ textTransform: 'lowercase' }}>
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
          </div>
        </div>
        <Typography variant="h6">Participants</Typography>
        <div id="video-grid" ref={videoGridRef}></div>
      </div>
    </>
  );
};

export default ChatRoom;