// client/src/pages/Messages/PendingRequests.tsx
import { useEffect, useState } from 'react';
import { api } from '../../features/api/api';

interface PendingRequest {
  id: string;
  requester: { id: string; name: string; avatar?: string | null };
}

export default function PendingRequests() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    api.get('/api/connections/pending').then(({ data }) => setRequests(data));
  }, []);

  async function accept(id: string) {
    await api.patch(`/api/connections/${id}/accept`);
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (requests.length === 0) return null;

  return (
    <div className="border-b border-border p-4">
      <h3 className="text-xs font-semibold text-text-muted mb-2">Connection requests</h3>
      {requests.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-2">
          <span className="text-sm text-foreground">{r.requester.name}</span>
          <button
            onClick={() => accept(r.id)}
            className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground">
            Accept
          </button>

        </div>
      ))}
    </div>
  );
}