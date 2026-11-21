// client/src/components/MessageButton.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../features/api/api';
import type { ChatUser, ConnectionStatus } from '../features/conversations/chat.type';

interface MessageButtonProps {
  targetUser: ChatUser;
  connectionStatus: ConnectionStatus; // 'NONE' | 'PENDING' | 'ACCEPTED'
}

export default function MessageButton({ targetUser, connectionStatus }: MessageButtonProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConnectionStatus>(connectionStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(connectionStatus);
  }, [connectionStatus, targetUser.id]);

  // Open profiles skip the connection requirement entirely
  const canMessageDirectly = targetUser.messagePolicy === 'ANYONE' || status === 'ACCEPTED';

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/connections/request', { receiverId: targetUser.id });
      setStatus('PENDING');
    } catch (err: any) {
      const message = err?.response?.data?.error ?? 'Failed to send connection request';
      setError(message);
      // If it already exists, backend tells us the real status — sync to it
      if (err?.response?.data?.status) {
        setStatus(err.response.data.status);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleMessage() {
    navigate(`/messages/${targetUser.id}`);
  }

  function renderConnectAction() {
    if (status === 'ACCEPTED') {
      return (
        <button
          disabled
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text-text-muted cursor-not-allowed">
          Connected
        </button>
      );
    }

    if (status === 'PENDING') {
      return (
        <button
          disabled
          className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-text-text-muted cursor-not-allowed">
          Pending
        </button>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className="rounded-full border border-primary px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50">
        {loading ? 'Sending...' : 'Connect'}
      </button>
    );
  }

  if (canMessageDirectly) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleMessage}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
          Message
        </button>
        {renderConnectAction()}
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <button
        disabled
        className="px-4 py-1.5 rounded-full bg-surface-raised text-text-muted text-sm font-medium cursor-not-allowed">
        Pending
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {renderConnectAction()}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}