import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, MessageSquare, ThumbsUp } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Btn, Card, EmptyState, ErrorNote, PageHeader, Segmented, Spinner, UserAvatar } from '../../components/nepal/ui';
import { getFeed } from '../../features/ecosystem/api/ecosystemApi';
import { timeAgo } from '../../features/nepal/meta';
import { useAsync } from '../../hooks/useAsync';

export default function Ideas() {
  const [type, setType] = useState<'IDEA' | 'FEEDBACK'>('IDEA');
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const res = useAsync(() => getFeed({ sort, type, limit: 20 }), [type, sort]);
  return (
    <>
      <SEO title="Ideas & feedback" url="/ideas" />
      <PageHeader title="Ideas & feedback" subtitle="Share a raw idea or ask for feedback on something you are building. People from other fields tell you what you cannot see yourself." actions={<Link to={`/ecosystem/new?type=${type}`}><Btn><Lightbulb className="size-4" />{type === 'IDEA' ? 'Share an idea' : 'Ask for feedback'}</Btn></Link>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Segmented label="Kind" value={type} onChange={setType} options={[{ value: 'IDEA', label: 'Ideas' }, { value: 'FEEDBACK', label: 'Feedback requests' }]} />
        <Segmented label="Sort" value={sort} onChange={setSort} options={[{ value: 'hot', label: 'Hot' }, { value: 'new', label: 'New' }, { value: 'top', label: 'Top' }]} />
      </div>
      {res.loading && !res.data ? <Spinner /> : res.error ? <ErrorNote message={res.error} onRetry={res.reload} /> : !res.data?.items.length ? <EmptyState title="Nothing here yet" hint="Be the first to post." action={<Link to={`/ecosystem/new?type=${type}`}><Btn>Post now</Btn></Link>} /> : (
        <div className="space-y-3">
          {res.data.items.map((p) => (
            <Link key={p.id} to={`/ecosystem/s/${p.space.slug}/post/${p.id}`} className="block">
              <Card className="p-4 transition-colors hover:border-primary/50">
                <div className="flex gap-3">
                  <UserAvatar user={p.author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-muted">{p.author.name} · {timeAgo(p.createdAt)} · {p.space.name}</p>
                    <h2 className="mt-0.5 font-semibold">{p.title}</h2>
                    {p.body && <p className="mt-1 line-clamp-2 text-sm text-text-muted">{p.body.replace(/[#*_`>\[\]]/g, '')}</p>}
                    <p className="tabular mt-2 flex gap-4 text-xs text-text-muted"><span className="flex items-center gap-1"><ThumbsUp className="size-3.5" aria-hidden />{p.score}</span><span className="flex items-center gap-1"><MessageSquare className="size-3.5" aria-hidden />{p.commentCount}</span></p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
