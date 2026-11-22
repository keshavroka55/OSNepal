import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/ui/button';
import { listSpaces } from '../../features/ecosystem/api/ecosystemApi';
import { PostList } from '../../features/ecosystem/components/PostList';
import { SortTabs } from '../../features/ecosystem/components/SortTabs';
import { usePostFeed } from '../../features/ecosystem/hooks/usePostFeed';
import { compactNumber } from '../../features/ecosystem/relativeTime';
import type { SortKey, Space } from '../../features/ecosystem/types';
import { getSpaceIcon } from '../../features/ecosystem/spaceIcons';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

export default function EcosystemPage() {
  const [params, setParams] = useSearchParams();
  const sort = (params.get('sort') as SortKey) || 'hot';
  const feed = usePostFeed({ sort });
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => { listSpaces().then(setSpaces).catch(() => setSpaces([])); }, []);

  return (
    <>
      <SEO title="Ecosystem" description="Discussions, questions and showcases from the people building and launching products." url="/ecosystem" />
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-6 pt-0 lg:grid-cols-[minmax(0,1fr)_260px]">
        <main>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">Ecosystem</h1>
            <div className="flex items-center gap-2">
              <SortTabs value={sort} options={SORTS} onChange={(s) => setParams({ sort: s })} />
              <Button asChild size="sm"><Link to="/ecosystem/new">New post</Link></Button>
            </div>
          </div>
          <PostList
            posts={feed.posts}
            loading={feed.loading}
            loadingMore={feed.loadingMore}
            error={feed.error}
            hasMore={feed.hasMore}
            onLoadMore={feed.loadMore}
            onRetry={feed.reload}
            emptyMessage="No posts yet. Be the first to start a conversation."
          />
        </main>

        <aside aria-label="Spaces" className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-2 text-sm font-semibold">Spaces</h2>
          {spaces.length === 0 ? (
            <p className="text-sm text-text-muted">No spaces yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {spaces.map((s) => {
                const Icon = getSpaceIcon(s.icon);
                return (
                  <li key={s.id}>
                    <Link to={`/ecosystem/s/${s.slug}`} className="flex min-h-11 items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-surface-raised">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4 text-text-muted" aria-hidden />
                        {s.name}
                      </span>
                      <span className="tabular text-xs text-text-muted">{compactNumber(s.memberCount)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
