import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:8080');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    // Add any other global socket event listeners here if needed
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
