// client/src/pages/Messages/ChatPage.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, SendHorizontal } from 'lucide-react';
import { api } from '../../features/api/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import type { Message, ChatUser } from '../../features/conversations/chat.type';

// ---------- small helpers ----------

const GROUP_GAP_MS = 5 * 60 * 1000; // messages further apart than this start a new group

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function formatTime(ts: string) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "Today", "Yesterday" or "12 Nov"
function dayLabel(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

// Two messages belong to the same visual group if same sender, same day, and close in time
function isSameGroup(a: Message | undefined, b: Message | undefined) {
  if (!a || !b) return false;
  return (
    a.senderId === b.senderId &&
    sameDay(new Date(a.createdAt), new Date(b.createdAt)) &&
    Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) < GROUP_GAP_MS
  );
}

// ---------- page ----------

export default function ChatPage() {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { socket, onlineUserIds, clearUnread } = useSocket();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOtherOnline = otherUserId ? onlineUserIds.has(otherUserId) : false;

  // Load conversation history + the other user's profile
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

  // Socket event wiring: the socket itself comes from SocketProvider
  useEffect(() => {
    if (!socket || !currentUser) return;

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
          m.conversationId === seenConvId && m.senderId === currentUser!.id
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

  // Mark as seen when the conversation opens, and clear this thread's share of the navbar badge
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

  // Keep the newest message (or typing bubble) in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOtherTyping]);

  // Auto-grow the textarea up to 128px, then scroll inside it
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

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
    inputRef.current?.focus(); // keep the keyboard open on mobile
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!currentUser || !otherUser) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-[13px] text-muted-foreground">
        {!currentUser ? 'Loading your session...' : 'Loading conversation...'}
      </div>
    );
  }

  return (
    // min-h-0 + flex-col: header and composer keep their size, only the message list scrolls
    <div className="flex h-full min-h-0 w-full flex-col bg-card text-foreground">
      {/* HEADER */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur sm:px-4">
        {/* Back button: mobile only */}
        <button
          type="button"
          onClick={() => navigate('/messages')}
          aria-label="Back to messages"
          className="-ml-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="relative shrink-0">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary text-[14px] font-semibold text-primary-foreground">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="size-full object-cover" />
            ) : (
              otherUser.name[0]?.toUpperCase()
            )}
          </div>
          {isOtherOnline && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-success"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-tight">{otherUser.name}</div>
          <div className="text-[12px] leading-tight text-muted-foreground">
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

      {/* MESSAGE LIST: the only part that scrolls */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-secondary/40 px-3 py-4 sm:px-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-xs text-center text-[13px] leading-relaxed text-muted-foreground">
              No messages yet. Say hi and start the conversation.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const mine = m.senderId === currentUser.id;

            const startsGroup = !isSameGroup(prev, m);
            const endsGroup = !isSameGroup(m, next);
            const newDay = !prev || !sameDay(new Date(prev.createdAt), new Date(m.createdAt));

            return (
              <div key={m.id}>
                {/* Day separator */}
                {newDay && (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                      {dayLabel(m.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${startsGroup ? 'mt-3' : 'mt-0.5'}`}>
                  <div className={`flex min-w-0 max-w-[82%] flex-col sm:max-w-[70%] ${mine ? 'items-end' : 'items-start'}`}>
                    {/* Bubble: only the last one in a group gets the "tail" corner */}
                    <div
                      className={`break-words rounded-2xl px-3.5 py-2 text-[15px] leading-[1.4] sm:text-[14px] ${
                        mine
                          ? `bg-primary text-primary-foreground ${endsGroup ? 'rounded-br-md' : ''}`
                          : `border border-border bg-card text-foreground ${endsGroup ? 'rounded-bl-md' : ''}`
                      }`}
                    >
                      <span className="whitespace-pre-wrap">{m.text}</span>
                    </div>

                    {/* Time and status under the last bubble of each group */}
                    {endsGroup && (
                      <div className="mt-1 flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                        {formatTime(m.createdAt)}
                        {mine &&
                          (m.seenAt ? (
                            <CheckCheck className="size-3.5 text-primary" aria-label="Seen" />
                          ) : (
                            <Check className="size-3.5" aria-label="Sent" />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {isOtherTyping && (
          <div className="mt-3 flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ERROR: floats just above the composer */}
      {error && (
        <div className="shrink-0 border-t border-danger/30 bg-danger/10 px-4 py-2 text-[12px] font-medium text-danger">
          {error}
        </div>
      )}

      {/* COMPOSER: pinned to the bottom, respects the iPhone home indicator */}
      <div className="shrink-0 border-t border-border bg-card px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4 sm:pb-3">
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 items-end rounded-3xl border border-border bg-background px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              aria-label="Type a message"
              // 16px on mobile stops iOS Safari from zooming the page when the input is focused
              className="max-h-32 w-full resize-none bg-transparent py-2.5 text-[16px] leading-[1.4] text-foreground outline-none placeholder:text-muted-foreground sm:text-[14px]"
            />
          </div>

          <button
            type="button"
            onClick={sendMessage}
            disabled={!text.trim()}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizontal className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}