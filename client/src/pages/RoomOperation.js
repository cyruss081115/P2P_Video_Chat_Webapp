import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, List, ListItem, Box } from '@mui/material';
import socket from '../socket';
import { SERVER_URL } from '../config';


const RoomOperation = () => {
  const [roomList, setRoomList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${SERVER_URL}/roomList`)
      .then((response) => response.json())
      .then((data) => setRoomList(data));
  }, []);

  socket.on('update-room', (roomList) => {
    setRoomList(roomList);
  });

  const createRoom = () => {
    socket.emit('create-room');
  };

  const joinRoom = (roomId) => {
    socket.emit('join-room', roomId);
    navigate(`/inRoom/${roomId}`)
  };

  return (
    <div>
      <Typography variant="h2">Room Selection</Typography>
      <Button onClick={() => createRoom()} variant="outlined" color="warning" sx={{ textTransform: 'lowercase' }}>
        Create Room
      </Button>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <List>
          {roomList?.map((room) => (
            <ListItem key={room.id}>
              <Box border={1} padding={4} display="flex" flexDirection="column" justifyContent='center' alignItems="center">
                Room ID: {room.id}
                <div style={{ marginBottom: '20px' }}/>
                <Button
                onClick={() => joinRoom(room.id)}
                variant="outlined"
                color="success"
                sx={{ width: 'fit-content', textTransform: 'lowercase' }}>
                  Join Room
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default RoomOperation;