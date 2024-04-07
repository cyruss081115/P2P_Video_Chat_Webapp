# CSCI3280 Project Phase 2

### Multi-user voice chat
Declaration: The multi-user voice chat is adapted from this tutorial [https://www.youtube.com/watch?v=DvlyzDZDEq4&t=1100s | How To Create A Video Chat App With WebRTC]

#### Usage
To run this application, execute:
```
$ npm run devStart
```
This will start a https server on https://localhost:3000.  

Note: If you are using CUHK1x WiFi, you may want to share your mobile network to your computer and launch the server using your mobile network. CUHK1x uses NAT which makes communication difficult in the local network.  

Each time a user visits https://localhost:3000, he/she will be directed to a new and unique chat room. An URL of a chatroom is in the following form: https://host.ip.address:3000/some-unique-chat-room-id. To join a chatroom, simply visits the same URL.  

Example:
Step 1: Launch the application 
Step 2: Visits https://localhost:3000/. You are automatically directed to an url https://localhost:3000/3b8e3379-392b-4a74-b178-c2e7be291374. 
Step 3: To join the same chatroom **on the same computer** use the same URL, https://localhost:3000/3b8e3379-392b-4a74-b178-c2e7be291374. To join this chatroom **on another device**, you need to figure out the IP address of the host computer in this local network. Then, you replace 'localhost' with that IP address. Eventually it becomes something like https://172.20.10.2:3000/3b8e3379-392b-4a74-b178-c2e7be291374  
Step 4: Allow the browser to access your microphone and camera 

