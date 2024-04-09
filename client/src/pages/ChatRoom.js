import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import Peer from "peerjs";
import socket from "../socket";

import {Typography, Button} from "@mui/material";

const ChatRoom = () => {
  const { roomId } = useParams();
  const videoGridRef = useRef();
  const peersRef = useRef({});
  const myPeerRef = useRef();
  const myVideoRef = useRef();

  const [ playStopMyVideoState, setPlayStopMyVideoState ] = useState(true);
  const [ muteUnmuteMyAudioState, setMuteUnmuteMyAudioState ] = useState(true);

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
          </div>
        </div>
        <Typography variant="h6">Participants</Typography>
        <div id="video-grid" ref={videoGridRef}></div>
      </div>
    </>
  );
};

export default ChatRoom;