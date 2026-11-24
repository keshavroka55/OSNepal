// client/src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { connectWS } from '../features/conversations/ws';
import { useAuth } from './AuthContext';
import { notify } from '../utils/notify';

interface SocketContextValue {
  socket: Socket | null;
  onlineUserIds: Set<string>;
  unreadTotal: number;
  bumpUnread: () => void;
  clearUnread: (count: number) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  onlineUserIds: new Set(),
  unreadTotal: 0,
  bumpUnread: () => { },
  clearUnread: () => { },
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [unreadTotal, setUnreadTotal] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socket = connectWS();
    setSocket(socket);

    const handleConnect = () => {
      socket.emit('requestOnlineUsers');
    };

    const handleReply = (data: { from: { name: string } }) => {
      notify.info(`${data.from.name} replied to you`);
    };

    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUserIds(new Set(ids));
    };

    const handleNewMessage = () => {
      setUnreadTotal((n) => n + 1);
    };

    const handleUserOnline = (id: string) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };

    const handleUserOffline = (id: string) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    };

    socket.on('connect', handleConnect);
    socket.on('reply:new', handleReply);
    socket.on('onlineUsers', handleOnlineUsers);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);
    socket.on('newMessage', handleNewMessage);

    // socket issues 

    socket.on("connect", () => {
      console.log("✅ Socket connected!");
      console.log("Socket ID:", socket.id);
      console.log("Transport:", socket.io.engine.transport.name);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection failed:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    socket.io.engine.on("upgrade", (transport) => {
      console.log("🚀 Transport upgraded to:", transport.name);
    });


    return () => {
      socket.off('connect', handleConnect);
      socket.off('reply:new', handleReply);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
      socket.off('newMessage', handleNewMessage);

      socket.disconnect();
      setSocket(null);
    };
  }, [user]);

  const bumpUnread = () => setUnreadTotal((n) => n + 1);
  const clearUnread = (count: number) => setUnreadTotal((n) => Math.max(0, n - count));

  return (
    <SocketContext.Provider
      value={{ socket, onlineUserIds, unreadTotal, bumpUnread, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}