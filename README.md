# CSCI3280 Project Phase 2

## Project overview

In this project, a web-based application is built to create a peer-to-peer (P2P) voice chat room enables voice calling between multiple computers. 

## Gallery
<img src="assets/homepage.png">
<img src="assets/chatroom.png">

## System Features

### Basic Features 

#### Chat room creation
- The user can create new chat room which allows other user to join in.

#### Chat room list 
- The chat room list is displayed in the application.
- The user can select and join their interested chatroom

#### Joining the chat room
- The user can join the chat room to participate in real-time communciation

#### Basic GUI
- Basic GUI is built for smooth user-experience for user to use the application

### Multi-user voice chat
Declaration: The multi-user voice chat is adapted from this tutorial [How To Create A Video Chat App With WebRTC](https://www.youtube.com/watch?v=DvlyzDZDEq4&t=1100s)


#### Support for multiple users
- Muliple users can join the same chat room

#### Continuous voice communication
- Smooth and uninterrupted conversation experience is achieved.

#### Simultaneous voice speaking
- User can speak concurrently for a natural conversation flow

#### Microphone control
- Mute/ Unmute buttons are set to control the user's microphone

#### Basic GUI
- Basic GUI is built for smooth user-experience for user to use the application

### Record 
- All user voice would be captured and it would be accessible because the user can download it 
#### Start/Stop function
- Start/ Stop button is built to record

### Enhanced feautres

#### Real-time video streaming
- The user stream will include both audio and video 

#### Message
- The user can message other user in the room 
#### Karaoke system
- The user can input the file to have the removal of the vocal version
- The user can play it and sing in front of all users. 



#### Usage
To run this application, execute:
```
$ npm run devStart
```
This will start a https server on https://localhost:3000.  

Note: If you are using CUHK1x WiFi, you may want to share your mobile network to your computer and launch the server using your mobile network. CUHK1x uses NAT which makes communication difficult in the local network.  

Each time a user visits https://localhost:3000, he/she will be directed to a new and unique chat room. An URL of a chatroom is in the following form: https://host.ip.address:3000/some-unique-chat-room-id. To join a chatroom, simply visits the same URL.  

https://localhost:3000 is the home page of the application, he/she can create new chat room. After new chat room is created, he can choose to delete it. Additionally, he can scroll down the page to join other chatroom. 

When they are clicked to join, they would be directed to https://host.ip.address:3000/some-unique-chat-room-id, a request of the media will be asked. Inside the chatroom, there are serveral buttons for users to control audio, video or send message or input music file to have the removal of vocal verision. They can leave the chatroom by clicking the "home" in the nav bar. 


Example:  
Step 1: Launch the application  
Step 2: Visits https://localhost:3000/. You are automatically directed to an url that looks like this: https://localhost:3000/3b8e3379-392b-4a74-b178-c2e7be291374.  
Step 3: To join the same chatroom ***on the same computer*** use the same URL, https://localhost:3000/3b8e3379-392b-4a74-b178-c2e7be291374. To join this chatroom ***on another device***, you need to figure out the IP address of the host computer in this local network. Then, you replace 'localhost' with that IP address. Eventually it becomes something like https://172.20.10.2:3000/3b8e3379-392b-4a74-b178-c2e7be291374  
Step 4: Allow the browser to access your microphone and camera  
Step 5: Have fun! 

