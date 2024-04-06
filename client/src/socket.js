import io from 'socket.io-client';
import { SERVER_URL } from './config';

const socket = io(SERVER_URL);

socket.on('connect', () => {
    console.log('connected to server');
});

export default socket;