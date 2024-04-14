function createPopUpBannerComponent(message, yesCallback, noCallback) {
  /**
   * Create a pop-up banner element with the given message and two buttons
   * @param {String} message - The message to display in the pop-up
   * @param {Function} yesCallback - The callback function for the "Yes" button
   * @param {Function} noCallback - The callback function for the "No" button
   * @returns {HTMLDivElement} - The pop-up element
   *
   * The pop-up banner element has the following structure:
   * <div class="alert alert-primary">
   *  <p>${message}</p>
   * <div class="d-flex justify-content-between align-items-baseline">
   *  <p>${message}</p>
   * <div class="d-flex justify-content-around gap-2">
   * <button class="btn btn-primary">Yes</button>
   * <button class="btn btn-danger">No</button>
   * </div>
   */
  const popUpBanner = document.createElement("div");
  popUpBanner.className = "alert alert-primary";

  const contentContainer = document.createElement("div");
  contentContainer.className =
    "d-flex justify-content-between align-items-baseline";

  const messageElement = document.createElement("p");
  messageElement.innerHTML = message;
  popUpBanner.appendChild(messageElement);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "d-flex justify-content-around gap-2";

  const yesButton = document.createElement("button");
  yesButton.className = "btn btn-primary";
  yesButton.innerHTML = "Yes";
  yesButton.onclick = () => {
    yesCallback();
    popUpBanner.remove();
  };

  const noButton = document.createElement("button");
  noButton.className = "btn btn-danger";
  noButton.innerHTML = "No";
  noButton.onclick = () => {
    noCallback();
    popUpBanner.remove();
  };

  buttonContainer.appendChild(yesButton);
  buttonContainer.appendChild(noButton);

  contentContainer.appendChild(messageElement);
  contentContainer.appendChild(buttonContainer);

  popUpBanner.appendChild(contentContainer);

  return popUpBanner;
}

function createQueryModalComponent(id, title, formQueries, proceedCallback, cancelCallback) {
  console.assert(typeof id === "string", "ID must be a string")
  console.assert(typeof title === "string", "Title must be a string")
  console.assert(Array.isArray(formQueries), "Form queries must be an array")
  console.assert(typeof proceedCallback === "function", "Proceed callback must be a function")
  console.assert(typeof cancelCallback === "function", "Cancel callback must be a function")


  const modalComponent = document.createElement("div");
  modalComponent.id = id;
  modalComponent.className = "modal fade";
  modalComponent.tabIndex = "-1";
  modalComponent.setAttribute("aria-labelledby", `${id}Label`);
  modalComponent.setAttribute("aria-hidden", "true");

  const modalDialog = document.createElement("div");
  modalDialog.className = "modal-dialog";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const modalTitle = document.createElement("h5");
  modalTitle.className = "modal-title";
  modalTitle.innerText = title;

  const modalCloseButton = document.createElement("button");
  modalCloseButton.type = "button";
  modalCloseButton.className = "btn-close";
  modalCloseButton.setAttribute("data-bs-dismiss", "modal");
  modalCloseButton.setAttribute("aria-label", "Close");

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(modalCloseButton);

  const modalBody = document.createElement("div");
  modalBody.className = "modal-body align-items-center";

  const modalQueryForm = document.createElement("form");
  const createFormQuery = (formQuery) => {
    const formQueryContainer = document.createElement("div");
    formQueryContainer.className = "mb-3";

    const formQueryTitle = document.createElement("label");
    formQueryTitle.className = "form-label";
    formQueryTitle.innerText = formQuery;
    formQueryTitle.htmlFor = `modal-form-${formQuery}`;
    formQueryContainer.appendChild(formQueryTitle);

    const formQueryInput = document.createElement("input");
    formQueryInput.id = `modal-form-${formQuery}`;
    formQueryInput.type = "text";
    formQueryInput.className = "form-control";
    formQueryInput.placeholder = formQuery;
    formQueryContainer.appendChild(formQueryInput);

    modalQueryForm.appendChild(formQueryContainer);
  }
  formQueries.forEach(createFormQuery);

  modalBody.appendChild(modalQueryForm);

  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer";

  const proceedButton = document.createElement("button");
  proceedButton.type = "button";
  proceedButton.className = "btn btn-primary";
  proceedButton.innerText = "Proceed";
  proceedButton.onclick = () => {
    const formQueryValues = formQueries.map((formQuery) => {
      return document.getElementById(`modal-form-${formQuery}`).value;
    });
    proceedCallback(formQueryValues);
  }

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-secondary";
  cancelButton.innerText = "Cancel";
  cancelButton.setAttribute("data-bs-dismiss", "modal");
  cancelButton.onclick = () => {
    cancelCallback();
  }

  modalFooter.appendChild(proceedButton);
  modalFooter.appendChild(cancelButton);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);

  modalDialog.appendChild(modalContent);
  modalComponent.appendChild(modalDialog);

  return modalComponent;
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

    // Create join room modal
    const joinRoomModal = createQueryModalComponent(
      `join-room-${roomId}`, "Join Room", ["Enter Username"],
      // Proceed callback
      (values) => {
        const username = values[0];
        if (username.length <= 0) {
          return alert("Please enter a username");
        }
        window.location.href = `/${roomId}?username=${username}`;
      },
      // Cancel callback
      () => {}
    );
    roomDisplayBody.appendChild(joinRoomModal);

    // Create join room button
    const joinRoomButton = document.createElement('button');
    joinRoomButton.className = "btn btn-primary";
    joinRoomButton.innerText = "Join Room";
    joinRoomButton.setAttribute("data-bs-toggle", "modal");
    joinRoomButton.setAttribute("data-bs-target", `#join-room-${roomId}`);

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

function createUserVideoComponent(username, stream, color="primary") {
    /**
     * Create a user video display component
     */
    // Create video container
    const userVideoComponent = document.createElement('div');
    userVideoComponent.className = "d-flex justify-content-center";
    
    const userVideoComponentCard = document.createElement('div');
    userVideoComponentCard.className = `card border-${color} d-flex justify-content-center`;
    userVideoComponentCard.style = "width: 20rem;";

    const userVideoComponentCardTitle = document.createElement('p');
    userVideoComponentCardTitle.className = `h4 text-center text-${color}`;
    userVideoComponentCardTitle.innerText = username;

    const userVideoContainer = document.createElement('div');
    userVideoContainer.className = "d-flex justify-content-center align-items-center pb-2";
    const userVideo = document.createElement('video');
    userVideo.id = `user-${username}-video`;
    userVideo.muted = true;
    userVideo.srcObject = stream;
    userVideo.style = "{width: 300px; height: 300px; object-fit: cover;}";
    userVideo.addEventListener("loadedmetadata", () => {
        userVideo.play();
    });
    userVideoContainer.appendChild(userVideo);

    userVideoComponentCard.appendChild(userVideoComponentCardTitle);
    userVideoComponentCard.appendChild(userVideoContainer);

    userVideoComponent.appendChild(userVideoComponentCard);

    return userVideoComponent;
}

function createChatBubble(message, username, color="primary") {
    /**
     * Create a chat bubble component
     */
    const chatBubble = document.createElement('div');
    chatBubble.className = `d-flex justify-content-start py-1`;
    const chatBubbleCard = document.createElement('div');
    chatBubbleCard.className = `card border-${color} d-flex justify-content-start`;
    chatBubbleCard.style = "width: 20rem;";
    const chatBubbleCardBody = document.createElement('div');
    chatBubbleCardBody.className = "card-body";
    const chatBubbleCardTitle = document.createElement('p');
    chatBubbleCardTitle.className = `h6 text-center text-${color}`;
    chatBubbleCardTitle.innerText = username;
    const chatBubbleCardText = document.createElement('p');
    chatBubbleCardText.className = `text-${color}`;
    chatBubbleCardText.innerText = message;
    chatBubbleCardBody.appendChild(chatBubbleCardTitle);
    chatBubbleCardBody.appendChild(chatBubbleCardText);
    chatBubbleCard.appendChild(chatBubbleCardBody);
    chatBubble.appendChild(chatBubbleCard);
    return chatBubble;
}

function createAlphabetFlatIconComponent(alphabet) {
  /**
   * Create an alphabet flat icon component
   * 
   * The alphabet flat icon component has the following structure:
   * <div class="d-flex justify-content-center align-middle" style="width: 45px; min-width: 45px; height: 45px; background-color: rgb(93, 113, 118); border-radius: 22px ; color: white;">
   *  <p class="m-0" style="vertical-align: middle; line-height: 45px; font-size: large;">{character}</p>
   * </div>
   */
  console.assert(alphabet.length == 1, "Character is required");

  const alphabetFlatIconComponent = document.createElement("div");
  alphabetFlatIconComponent.className = "d-flex justify-content-center align-middle";
  alphabetFlatIconComponent.style = "width: 45px; min-width: 45px; height: 45px; background-color: rgb(93, 113, 118); border-radius: 22px ; color: white;";

  const alphabetTextField = document.createElement("p");
  alphabetTextField.className = "m-0";
  alphabetTextField.style = "vertical-align: middle; line-height: 45px; font-size: large;";
  alphabetTextField.innerText = alphabet;

  alphabetFlatIconComponent.appendChild(alphabetTextField);

  return alphabetFlatIconComponent;
}

// TODO: Create chat bubble component
function createChatBubbleComponent(username, message) {
  /**
   * Create a chat bubble component
   *
   * @param {String} username - The username of the chat message
   * @param {String} message - The message content
   * @returns {HTMLDivElement} - The chat bubble component
   *
   * The chat bubble component has the following structure:
   * <div class="d-flex flex-row justify-content-start mb-4">
   *  <div class="d-flex justify-content-center align-middle" style="width: 45px; min-width: 45px; height: 45px; background-color: rgb(93, 113, 118); border-radius: 22px ; color: white;">
   *   <p class="m-0" style="vertical-align: middle; line-height: 45px; font-size: large;">{character}</p>
   *  </div>
   *  <div class="ms-3">
   *   <p class="h6 mb-1">{username}</p>
   *   <div class="p-3" style="border-radius: 15px; background-color: rgba(57, 192, 237,.2);">
   *    <p class="small mb-0">{message}</p>
   *   </div>
   *  </div>
   * </div>
   *
   */
  const chatBubble = document.createElement("div");
  chatBubble.className = "d-flex flex-row justify-content-start mb-4";

  const userAvatar = createAlphabetFlatIconComponent(username[0]);

  const chatBubbleContentContainer = document.createElement("div");
  chatBubbleContentContainer.className = "ms-3";

  const usernameElement = document.createElement("p");
  usernameElement.className = "h6 mb-1";
  usernameElement.innerText = username;

  const chatBubbleContentBody = document.createElement("div");
  chatBubbleContentBody.className = "p-3";
  chatBubbleContentBody.style = "border-radius: 15px; background-color: rgba(57, 192, 237,.2);"

  const chatBubbleContentBodyText = document.createElement("p");
  chatBubbleContentBodyText.className = "small mb-0";
  chatBubbleContentBodyText.innerText = message;

  chatBubbleContentBody.appendChild(chatBubbleContentBodyText);

  chatBubbleContentContainer.appendChild(usernameElement);
  chatBubbleContentContainer.appendChild(chatBubbleContentBody);

  chatBubble.appendChild(userAvatar);
  chatBubble.appendChild(chatBubbleContentContainer);

  return chatBubble

}
// TODO: Create chat room component