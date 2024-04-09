const roomDisplayContainer = document.getElementById('room-display-container');

const updateRoomDisplay = () => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            const roomList = JSON.parse(xmlHttp.responseText);
            roomDisplayContainer.innerHTML = '';
            roomList.forEach(room => {
                const roomDisplay = createRoomDisplay(room.roomId);
                roomDisplayContainer.appendChild(roomDisplay);
            });
        }
    }
    xmlHttp.open("GET", `${URL}/roomOps/roomList`, true); // true for asynchronous 
    xmlHttp.send(null);
}

createRoom = () => {
    console.log('create room');
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        updateRoomDisplay();
    }
    xmlHttp.open("POST", `${URL}/roomOps/createRoom`, true); // true for asynchronous 
    xmlHttp.send(null);
}

removeRoom = (roomId) => {
    console.log('remove room with id: ', roomId);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        console.log('room removed');
        updateRoomDisplay();
    }
    xmlHttp.open("DELETE", `${URL}/roomOps/removeRoom/${roomId}`, true); // true for asynchronous
    xmlHttp.send(null);
}

// Create room display as card using bootstrap
const createRoomDisplay = (roomId) => {
    /**
     * Create a room display card using bootstrap styling
     * The DivElement has the following structure:
     * <div class="d-flex justify-content-center py-1">
     *  <div class="card py-3" style="width: 20rem;" id="room-${roomId}">
     *     <div class="card-body">
     *        <p class="card-title text-center">Room ID: ${roomId}</p>
     *       <div class="d-flex justify-content-around">
     *         <button class="btn btn-primary">Join Room</button>
     *         <button class="btn btn-danger">Remove Room</button>
     *       </div>
     *     </div>
     *  </div>
     * </div>
     * @param {String} roomId - The room ID to display
     * @returns {HTMLDivElement} - The room display card
     */
    // Create room display wrapper for centering
    const roomDisplayWrapper = document.createElement('div');
    roomDisplayWrapper.className = "d-flex justify-content-center py-1";
    // Create room display card
    const roomDisplay = document.createElement('div');
    roomDisplay.className = "card py-3"
    roomDisplay.style = "width: 20rem;";
    roomDisplay.id = `room-${roomId}`
    // Create room display body
    const roomDisplayBody = document.createElement('div');
    roomDisplayBody.className = "card-body";
    // Create room display title
    const roomDisplayTitle = document.createElement('p');
    roomDisplayTitle.className = "card-title text-center";
    roomDisplayTitle.innerText = `Room ID: ${roomId}`;

    // Create join room button
    const joinRoomButton = document.createElement('button');
    joinRoomButton.className = "btn btn-primary";
    joinRoomButton.innerText = "Join Room";
    joinRoomButton.onclick = () => {
        window.location.href = `/${roomId}`;
    }
    // Create remove room button
    const removeRoomButton = document.createElement('button');
    removeRoomButton.className = "btn btn-danger";
    removeRoomButton.innerText = "Remove Room";
    removeRoomButton.onclick = () => {
        removeRoom(roomId);
        updateRoomDisplay();
    }
    // Append room display title to room display body
    roomDisplayBody.appendChild(roomDisplayTitle);
    const roomDisplayButtons = document.createElement('div');
    roomDisplayButtons.className = "d-flex justify-content-around";
    roomDisplayButtons.appendChild(joinRoomButton);
    roomDisplayButtons.appendChild(removeRoomButton);
    // Append room display buttons to room display body
    roomDisplayBody.appendChild(roomDisplayButtons);
    // append room display body to room display
    roomDisplay.appendChild(roomDisplayBody)
    // Append room display to room display wrapper
    roomDisplayWrapper.appendChild(roomDisplay);
    return roomDisplayWrapper;
}

// Update room display on page load
updateRoomDisplay();

