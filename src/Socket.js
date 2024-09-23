// src/socket.js
import io from "socket.io-client";
const userId = localStorage.getItem("userId");
const Socket = io("http://localhost:8001", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  query: { userId: userId },
});

export default Socket;
