// client/src/services/ws.js
import { io } from 'socket.io-client';

export function connectWS() {
  return io(import.meta.env.VITE_WS_URL, {
    withCredentials: true, // sends the httpOnly cookie automatically
  });
}