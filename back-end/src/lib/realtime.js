// Thin handle on the single Socket.io server created in server.js, so
// services can push events without importing the HTTP server.
let io = null;

export const setIO = (server) => {
  io = server;
};

export const emitToRoom = (room, event, payload) => {
  if (io) io.to(room).emit(event, payload);
};

export const postRoom = (postId) => `post:${postId}`;
export const userRoom = (userId) => `user:${userId}`;
