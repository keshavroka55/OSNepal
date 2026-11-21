import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import type { Post } from '../types';
import { PostCard, PostCardSkeleton } from './PostCard';
import { ReportDialog } from './ReportDialog';

interface PostListProps {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  showSpace?: boolean;
  emptyMessage?: string;
}

// Loading, error, empty and "load more" states for every post list.
export function PostList({ posts, loading, loadingMore, error, hasMore, onLoadMore, onRetry, showSpace, emptyMessage }: PostListProps) {
  const [reporting, setReporting] = useState<string | null>(null);

  if (loading) return <div aria-busy="true">{[0, 1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}</div>;

  if (error && posts.length === 0) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-center" role="alert">
        <p className="text-sm text-text">We couldn't load posts right now.</p>
        <Button className="mt-3" variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-text-muted">
        {emptyMessage ?? 'Nothing here yet.'}
      </p>
    );
  }

  return (
    <>
      <div>{posts.map((p) => <PostCard key={p.id} post={p} showSpace={showSpace} onReport={setReporting} />)}</div>
      {hasMore && (
        <div className="py-4 text-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>{loadingMore ? 'Loading...' : 'Load more'}</Button>
        </div>
      )}
      <ReportDialog target={reporting ? { type: 'POST', id: reporting } : null} onClose={() => setReporting(null)} />
    </>
  );
}
