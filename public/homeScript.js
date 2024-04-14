const SERVER_URL = "https://" + window.location.host;
const createRoomButton = document.getElementById("create-room-button");
const roomComponentContainer = document.getElementById("room-component-container");

const updateRoomDisplay = () => {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      const roomList = JSON.parse(xmlHttp.responseText);
      roomComponentContainer.innerHTML = "";
      roomList.forEach((room) => {
        const roomComponent = createRoomComponent(room.roomId, room.users.length);
        roomComponentContainer.appendChild(roomComponent);
      });
    }
  };
  xmlHttp.open("GET", `${SERVER_URL}/roomOps/roomList`, true); // true for asynchronous
  xmlHttp.send(null);
};

const createRoom = () => {
  console.log("create room");
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) updateRoomDisplay();
  };
  xmlHttp.open("POST", `${SERVER_URL}/roomOps/createRoom`, true); // true for asynchronous
  xmlHttp.send(null);
};

const removeRoom = (roomId) => {
  console.log("remove room with id: ", roomId);
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      console.log("room removed");
    updateRoomDisplay();
  };
  xmlHttp.open("DELETE", `${SERVER_URL}/roomOps/removeRoom/${roomId}`, true); // true for asynchronous
  xmlHttp.send(null);
};

// Update room display on page load
updateRoomDisplay();
createRoomButton.onclick = createRoom;

const tmpContainer = document.getElementById("tmp-container");

const chatBubbleComponent = createChatBubbleComponent("David", "nihaoma!");
const chatBubbleComponent2 = createChatBubbleComponent("Johnny", "cao!");
console.log(chatBubbleComponent);
tmpContainer.appendChild(chatBubbleComponent);
tmpContainer.appendChild(chatBubbleComponent2);
const modalComponent = createQueryModalComponent("myModal", "heelo", ["Username", "My idk", "aslkdf", "alsdjf;lakjsd;fk"], (value) => {console.log(value)}, () => {console.log("no")});

tmpContainer.appendChild(modalComponent);
const tmpButton = document.createElement("div");
tmpButton.innerHTML = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">
Open modal
</button>
`

tmpContainer.appendChild(tmpButton);
