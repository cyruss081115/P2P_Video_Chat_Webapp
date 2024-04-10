function createPopUpComponent(message, yesCallback, noCallback) {
  /**
   * Create a pop-up element with the given message and two buttons
   * @param {String} message - The message to display in the pop-up
   * @param {Function} yesCallback - The callback function for the "Yes" button
   * @param {Function} noCallback - The callback function for the "No" button
   * @returns {HTMLDivElement} - The pop-up element
   *
   * The pop-up element has the following structure:
   * <div class="alert alert-primary">
   *  <p>${message}</p>
   * <div class="d-flex justify-content-between align-items-baseline">
   *  <p>${message}</p>
   * <div class="d-flex justify-content-around gap-2">
   * <button class="btn btn-primary">Yes</button>
   * <button class="btn btn-danger">No</button>
   * </div>
   */
  const popUp = document.createElement("div");
  popUp.className = "alert alert-primary";

  const contentContainer = document.createElement("div");
  contentContainer.className =
    "d-flex justify-content-between align-items-baseline";

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

function createRoomComponent(roomId, numParticipants) {
    /**
     * Create a room display card using bootstrap styling
     * The DivElement has the following structure:
     * <div class="d-flex justify-content-center py-1">
     *  <div class="card py-3" style="width: 20rem;" id="room-${roomId}">
     *     <div class="card-body">
     *       <p class="card-title text-center">Room ID: ${roomId}</p>
     *       <p class="card-subtitle text-center">Participants: ${numParticipants}</p>
     *       <div class="d-flex justify-content-around">
     *         <button class="btn btn-primary">Join Room</button>
     *         <button class="btn btn-danger">Remove Room</button>
     *       </div>
     *     </div>
     *  </div>
     * </div>
     * @param {String} roomId - The room ID to display
     * @param {Number} numParticipants - The number of participants in the room
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
    // Create room display subtitle
    const roomDisplaySubtitle = document.createElement('p');
    roomDisplaySubtitle.className = "card-subtitle text-center";
    roomDisplaySubtitle.innerText = `Participants: ${numParticipants}`;


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
    // Append room display subtitle to room display body
    roomDisplayBody.appendChild(roomDisplaySubtitle);
    const roomDisplayButtons = document.createElement('div');
    roomDisplayButtons.className = "d-flex justify-content-around py-2";
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
