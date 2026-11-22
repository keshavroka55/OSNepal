import { useEffect, useState } from 'react';
import { listSpaces } from '../api/ecosystemApi';
import type { Space } from '../types';

export function useJoinedSpaces() {
  const [joined, setJoined] = useState<Space[] | null>(null); // null = still loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    listSpaces()
      .then((all) => { if (alive) setJoined(all.filter((s) => s.viewerRole)); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []);

  return { joined, error, loading: joined === null && !error };
}