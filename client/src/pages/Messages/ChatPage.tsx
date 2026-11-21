// client/src/pages/Messages/ChatPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../features/api/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import type { Message, ChatUser } from '../../features/conversations/chat.type';
import { ArrowLeft, Send } from 'lucide-react';

export default function ChatPage() {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { socket, onlineUserIds, clearUnread } = useSocket();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOtherOnline = otherUserId ? onlineUserIds.has(otherUserId) : false;

  // Load conversation history + other user's profile
  useEffect(() => {
    if (!otherUserId) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/conversations/with/${otherUserId}`);
        setConversationId(data.conversationId);
        setOtherUser(data.otherUser);
        setMessages(data.messages);
      } catch (err) {
        console.error('Failed to load conversation', err);
      }
    })();
  }, [otherUserId]);

  // Socket event wiring — socket itself comes from SocketProvider, not created here
  useEffect(() => {
    if (!socket) return;
    if (!currentUser) return;

    function handleNewMessage(msg: Message) {
      if (msg.senderId === otherUserId) {
        setMessages((prev) => [...prev, msg]);
        socket?.emit('markSeen', { conversationId: msg.conversationId });
      }
    }

    function handleMessageSent(msg: Message) {
      setMessages((prev) => [...prev, msg]);
    }

    function handleMessageError({ reason }: { reason: string }) {
      setError(reason);
      setTimeout(() => setError(null), 4000);
    }

    function handleTyping(id: string) {
      if (id === otherUserId) setIsOtherTyping(true);
    }

    function handleStopTyping(id: string) {
      if (id === otherUserId) setIsOtherTyping(false);
    }

    function handleMessagesSeen({ conversationId: seenConvId }: { conversationId: string }) {
      setMessages((prev) =>
        prev.map((m) =>
          m.conversationId === seenConvId && m.senderId === currentUser.id
            ? { ...m, seenAt: m.seenAt ?? new Date().toISOString() }
            : m
        )
      );
    }

    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageError', handleMessageError);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messagesSeen', handleMessagesSeen);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
      socket.off('messageError', handleMessageError);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messagesSeen', handleMessagesSeen);
    };
  }, [socket, otherUserId, currentUser?.id]);

  // Mark as seen once the conversation is loaded/opened, and clear this thread's contribution to the navbar badge
  useEffect(() => {
    if (conversationId && socket) {
      socket.emit('markSeen', { conversationId });
      const unreadInThisThread = messages.filter(
        (m) => m.receiverId === currentUser?.id && !m.seenAt
      ).length;
      if (unreadInThisThread > 0) clearUnread(unreadInThisThread);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleTextChange(value: string) {
    setText(value);
    if (!otherUserId || !socket) return;

    socket.emit('typing', { receiverId: otherUserId });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: otherUserId });
    }, 1000);
  }

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || !otherUserId || !socket) return;

    socket.emit('sendMessage', { receiverId: otherUserId, text: trimmed });
    setText('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socket.emit('stopTyping', { receiverId: otherUserId });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-muted-foreground">
        Loading your session...
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-muted-foreground">
        Loading conversation...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-card text-foreground">
      {/* HEADER */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {/* Back button — mobile only */}
        <button
          type="button"
          onClick={() => navigate('/messages')}
          aria-label="Back to messages"
          className="-ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-[14px] font-semibold text-primary-foreground">
            {otherUser.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="h-full w-full object-cover"
              />
            ) : (
              otherUser.name[0]
            )}
          </div>
          {isOtherOnline && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-foreground">
            {otherUser.name}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {isOtherTyping ? (
              <span className="text-primary">typing…</span>
            ) : isOtherOnline ? (
              'Online'
            ) : (
              'Offline'
            )}
          </div>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="border-b border-danger/30 bg-danger/10 px-4 py-2 text-[12px] font-medium text-danger   ">
          {error}
        </div>
      )}

      {/* MESSAGE LIST */}
      <div className="flex flex-1 flex-col space-y-2 overflow-y-auto bg-secondary/50 p-4">
        {messages.length === 0 ? (
          <div className="m-auto max-w-xs text-center text-[13px] leading-relaxed text-muted-foreground">
            No messages yet. Say hi and start the conversation.
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] rounded-[18px] p-3 text-[14px] leading-[1.45] shadow-sm ${
                    mine
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md border border-border bg-card text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
                      mine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(m.createdAt)}
                    {mine && <span aria-label={m.seenAt ? 'Seen' : 'Sent'}>{m.seenAt ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* COMPOSER */}
      <div className="border-t border-border bg-card px-3 py-3 sm:px-4">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-background px-2 py-1 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={!otherUser}
            className="max-h-32 w-full resize-none bg-transparent px-2 py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!text.trim() || !otherUser}
            aria-label="Send message"
            className="mb-1 flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}