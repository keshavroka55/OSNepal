import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { getSpace } from '../../features/ecosystem/api/ecosystemApi';
import { PostList } from '../../features/ecosystem/components/PostList';
import { SortTabs } from '../../features/ecosystem/components/SortTabs';
import { SpaceSidebar } from '../../features/ecosystem/components/SpaceSidebar';
import { usePostFeed } from '../../features/ecosystem/hooks/usePostFeed';
import type { SortKey, Space } from '../../features/ecosystem/types';
import NotFoundPage from '../NotFoundPage';

export default function SpacePage() {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const sort = (params.get('sort') as SortKey) || 'hot';
  const [space, setSpace] = useState<Space | null>(null);
  const [missing, setMissing] = useState(false);
  const feed = usePostFeed({ sort, space: slug });

  useEffect(() => {
    setSpace(null);
    setMissing(false);
    getSpace(slug).then(setSpace).catch(() => setMissing(true));
  }, [slug]);

  if (missing) return <NotFoundPage />;

  return (
    <>
      <SEO title={space ? space.name : 'Space'} description={space?.description} url={`/ecosystem/s/${slug}`} />
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-6 pt-0 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">{space ? `${space.icon ?? ''} ${space.name}` : 'Loading...'}</h1>
            <SortTabs
              value={sort}
              onChange={(s) => setParams({ sort: s })}
              options={[{ value: 'hot', label: 'Hot' }, { value: 'new', label: 'New' }, { value: 'top', label: 'Top' }]}
            />
          </div>
          <PostList
            posts={feed.posts}
            loading={feed.loading}
            loadingMore={feed.loadingMore}
            error={feed.error}
            hasMore={feed.hasMore}
            onLoadMore={feed.loadMore}
            onRetry={feed.reload}
            showSpace={false}
            emptyMessage="No posts in this space yet. Join and start the first one."
          />
        </main>
        {space && <SpaceSidebar space={space} onChange={setSpace} />}
      </div>
    </>
  );
}
