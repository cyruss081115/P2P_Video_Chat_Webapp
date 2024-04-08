import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import Peer from "peerjs";


const VideoChat = () => {
  const { roomId } = useParams();
  const [peers, setPeers] = useState({});
  const myPeer = useRef(null);
  const myVideo = useRef(null);
  const videoGrid = useRef(null);

  const addVideoStream = useCallback(
    (video, stream) => {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      videoGrid.current.append(video);
    },
    [videoGrid]
  );

  const connectToNewUser = useCallback(
    (userId, stream) => {
      console.log("calling connect to new user");
      const call = myPeer.current.call(userId, stream);
      console.log(call);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        console.log("streaming user video");
        addVideoStream(video, userVideoStream);
      });
      call.on("close", () => {
        video.remove();
      });

      setPeers((prevPeers) => ({ ...prevPeers, [userId]: call }));
    },
    [addVideoStream]
  );

  useEffect(() => {
    myVideo.current = document.createElement("video");
    myVideo.current.muted = true;
    videoGrid.current = document.getElementById("video-grid");

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        myPeer.current = new Peer();
        addVideoStream(myVideo.current, stream);
        myPeer.current.on("open", (id) => {
          socket.emit("join-room", roomId, id);
        });
        myPeer.current.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
          });
        });

        socket.on("user-connected", (userId) => {
          console.log("Connecting new user", userId);
          connectToNewUser(userId, stream);
        });
      })
      .catch((error) => {
        console.log("Error: ", error);
      });

    socket.on("user-disconnected", (userId) => {
      console.log("User disconnected");
      if (peers[userId]) peers[userId].close();
    });
  }, [peers, myPeer, myVideo, roomId, addVideoStream, connectToNewUser]);

  return <div id="video-grid" ref={videoGrid}></div>;
};

export default VideoChat;
