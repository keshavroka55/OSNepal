import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed, type FeedParams } from '../api/ecosystemApi';
import type { Post } from '../types';

type FeedFilters = Omit<FeedParams, 'cursor'>;

// Cursor-paginated feed. Resets whenever the filters change, and ignores
// responses that arrive after the filters moved on.
export function usePostFeed(filters: FeedFilters) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const key = JSON.stringify(filters);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(false);
    try {
      const page = await getFeed(JSON.parse(key));
      if (id !== requestId.current) return;
      setPosts(page.items);
      setNextCursor(page.nextCursor);
    } catch {
      if (id === requestId.current) setError(true);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    const id = requestId.current;
    setLoadingMore(true);
    try {
      const page = await getFeed({ ...JSON.parse(key), cursor: nextCursor });
      if (id !== requestId.current) return;
      setPosts((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, key]);

  return { posts, loading, loadingMore, error, hasMore: Boolean(nextCursor), loadMore, reload: load };
}
