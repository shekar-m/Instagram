// src/socket.js
import io from 'socket.io-client';

const Socket = io('http://localhost:8001', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

export default Socket;
