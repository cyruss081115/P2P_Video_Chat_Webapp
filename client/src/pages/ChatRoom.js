import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import { Button } from '@mui/material';

const ChatRoom = () => {
  const isMicrophoneOn = useRef(true);
  const [microphone, setMicrophone] = useState(true);
      
  useEffect(() => {
    const sendDataToServer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });


        const audioChunks = [];
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const binaryData = new Blob(audioChunks, { type: 'audio/ogg' });
          socket.emit('server-forwardAudioData', binaryData);
          if (isMicrophoneOn.current) {
            startRecording();
          }
          else{
            console.log("stopped micro");
          }
        });

        const startRecording = () => {
          audioChunks.length = 0;
          mediaRecorder.start();
          
          setTimeout(() => {
            mediaRecorder.stop();
          }, 3000);
        }


        startRecording();

      } catch (error) {
        console.error(error);
      }
    };

    if (isMicrophoneOn.current){
      sendDataToServer();
    }
  }, [microphone]);


  
  socket.on('client-receiveAudioData', (data) => {
    console.log(data);

    const blob = new Blob([data], { type: 'audio/ogg' });

    const context = new AudioContext();
    const source = context.createBufferSource();

    const fileReader = new FileReader();
    fileReader.onload = function() {
      context.decodeAudioData(this.result, function(buffer) {
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
      });
    };
    fileReader.readAsArrayBuffer(blob);
  });



  const microphoneControl = () => {
      isMicrophoneOn.current = !isMicrophoneOn.current;
      setMicrophone(!microphone);
  };

  
  return (
    <div>
      <Button onClick={() => {microphoneControl()}}>
        mute/unmute
      </Button>
    </div>
  );
};

export default ChatRoom;