import app from "./src/app.js";
import { config } from "./src/config/config.js";

import http from "http";
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server } from "socket.io";
import prisma from "./src/prisma.js";
import { markMessagesSeen, createMessage, findOrCreateConversation } from "./src/modules/conversations/conversation.service.js";
import { canUsersMessage } from "./src/modules/connections/connection.service.js";
import { setIO, userRoom, postRoom } from "./src/lib/realtime.js";
import { refreshHotScores } from "./src/modules/posts/post.service.js";



const server = http.createServer(app);


const io = new Server(server, {
  cors: { origin: config.allowedOrigins, credentials: true },
});
setIO(io);

// Socket auth middleware — runs once per connection, before any events fire
io.use((socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) return next(new Error('No cookie'));

    const { token } = cookie.parse(rawCookie);
    if (!token) return next(new Error('No token'));

    const decoded = jwt.verify(token, config.JWT_SECRET);
    // JWT payload in this project uses { id, role }
    socket.userId = decoded.id || decoded.userId;
    if (!socket.userId) return next(new Error('Invalid token payload'));
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});


const onlineUsers = new Map(); // userId -> socketId

function broadcastOnlineUsers() {
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));
}

io.on('connection', (socket) => {
  // Personal room: lets services push "new reply" events to one user.
  socket.join(userRoom(socket.userId));

  // Post rooms carry live comment counts. Reading is public, so any
  // signed-in socket may watch a post; ids are length-checked only.
  socket.on('post:join', (postId) => {
    if (typeof postId === 'string' && postId.length <= 64) socket.join(postRoom(postId));
  });
  socket.on('post:leave', (postId) => {
    if (typeof postId === 'string') socket.leave(postRoom(postId));
  });

  onlineUsers.set(socket.userId, socket.id);
  broadcastOnlineUsers();
  io.emit('userOnline', socket.userId); // notify everyone (or scope to connections only)

  socket.on('requestOnlineUsers', () => {
    socket.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', async ({ receiverId, text }) => {
    try {
      const check = await canUsersMessage(socket.userId, receiverId);
      if (!check.allowed) {
        socket.emit("messageError", { reason: check.reason });
        return;
      }

      const conversation = await findOrCreateConversation(socket.userId, receiverId);
      const savedMessage = await createMessage({
        conversationId: conversation.id,
        senderId: socket.userId,
        receiverId,
        text,
      });


      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', savedMessage);
      }
      socket.emit('messageSent', savedMessage);
    } catch (err) {
      console.error("sendMessage error:", err.message);
      socket.emit('messageError', { reason: "Failed to send message" })
    }
  });

  socket.on('typing', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('typing', socket.userId);
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit('stopTyping', socket.userId);
  });

  socket.on('markSeen', async ({ conversationId }) => {
    try {
      await markMessagesSeen(conversationId, socket.userId);

      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conversation) {
        return;
      }

      const otherUserId = conversation.userAId === socket.userId ? conversation.userBId : conversation.userAId;
      const otherUserSocketId = onlineUsers.get(otherUserId);
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit('messagesSeen', { conversationId });
      }

    } catch (err) {
      console.error('markSeen error:', err.message);
    }
  });

  socket.on('disconnect', async () => {
    onlineUsers.delete(socket.userId);
    broadcastOnlineUsers();
    io.emit('userOffline', socket.userId);
    // optional: await prisma.user.update({ where: { id: socket.userId }, data: { lastSeenAt: new Date() } });
  });
});


// Hot scores decay with time, so refresh recent posts every 10 minutes.
const HOT_REFRESH_MS = 10 * 60 * 1000;
setInterval(() => {
  refreshHotScores().catch((err) => console.error('Hot score refresh failed:', err.message));
}, HOT_REFRESH_MS).unref();

server.listen(config.PORT, () => {
  console.info(`Server running on port ${config.PORT}`);
});
