const socket = io("/");

myUserID = uuidv4();
socket.emit("join-room", ROOM_ID, USERNAME, myUserID);

let isMicrophoneOn = true;

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
            socket.emit('server-forwardAudioData', ROOM_ID, binaryData);
            if (isMicrophoneOn) {
                startRecording();
            } else {
                console.log("stopped microphone");
            }
        });

        const startRecording = () => {
            audioChunks.length = 0;
            mediaRecorder.start();

            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000);
        };

        startRecording();
    } catch (error) {
        console.error(error);
    }
};

if (isMicrophoneOn) {
    sendDataToServer();
}

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

const muteButton = document.getElementById("mute-button");
muteButton.onclick = () => {
    console.log("mute button clicked");
    isMicrophoneOn = !isMicrophoneOn;
    
    if (isMicrophoneOn) {
        sendDataToServer();
    }
};