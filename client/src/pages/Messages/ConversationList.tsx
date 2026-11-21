// client/src/pages/Messages/ConversationList.tsx
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../../features/api/api';
import { useSocket } from '../../contexts/SocketContext';

interface Connection {
  id: string;
  name: string;
  avatar?: string | null;
}

interface ConversationSummary {
  conversationId: string;
  otherUser: { id: string; name: string; avatar?: string | null };
  lastMessage: { text: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

// Merged shape the UI actually renders — one row per connection,
// with conversation data attached if it exists yet
interface ChatListEntry {
  otherUser: { id: string; name: string; avatar?: string | null };
  conversationId: string | null;
  lastMessage: ConversationSummary['lastMessage'];
  unreadCount: number;
}

export default function ConversationList() {
  const { onlineUserIds, socket } = useSocket();
  const [entries, setEntries] = useState<ChatListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEntries() {
    try {
      const [{ data: connections }, { data: conversations }] = await Promise.all([
        api.get<Connection[]>('/api/connections'),
        api.get<ConversationSummary[]>('/api/conversations'),
      ]);

      // Index existing conversations by the other user's id for O(1) lookup
      const conversationByUserId = new Map(
        conversations.map((c) => [c.otherUser.id, c])
      );

      // One entry per connection — attach conversation data if it exists, otherwise null/empty
      const merged: ChatListEntry[] = connections.map((connection) => {
        const existing = conversationByUserId.get(connection.id);
        return {
          otherUser: existing?.otherUser ?? connection,
          conversationId: existing?.conversationId ?? null,
          lastMessage: existing?.lastMessage ?? null,
          unreadCount: existing?.unreadCount ?? 0,
        };
      });

      // Most recent activity first; connections with no messages yet sink to the bottom
      merged.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? '';
        const bTime = b.lastMessage?.createdAt ?? '';
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setEntries(merged);
    } catch (err) {
      console.error('Failed to load conversation list', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadEntries();
    socket.on('newMessage', refresh);
    socket.on('messageSent', refresh);
    return () => {
      socket.off('newMessage', refresh);
      socket.off('messageSent', refresh);
    };
  }, [socket]);

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading...</div>;

  if (entries.length === 0) {
    return <div className="p-4 text-sm text-text-muted">No connections yet. Connect with someone to start chatting.</div>;
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {entries.map((entry) => (
        <NavLink
          key={entry.otherUser.id}
          to={`/messages/${entry.otherUser.id}`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 sm:py-3 hover:bg-surface-raised active:bg-surface-raised ${isActive ? 'bg-primary/5' : ''}`
          }>
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold overflow-hidden">
              {entry.otherUser.avatar ? (
                <img src={entry.otherUser.avatar} alt={entry.otherUser.name} className="h-full w-full object-cover" />
              ) : (
                entry.otherUser.name[0]
              )}
            </div>
            {onlineUserIds.has(entry.otherUser.id) && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground truncate">{entry.otherUser.name}</span>
              {entry.unreadCount > 0 && (
                <span className="text-[10px] bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {entry.unreadCount}
                </span>
              )}
            </div>
            <p className={`text-xs truncate ${entry.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-text-muted'}`}>
              {entry.lastMessage?.text ?? 'Say hello 👋'}
            </p>
          </div>
        </NavLink>
      ))}
    </div>
  );
}