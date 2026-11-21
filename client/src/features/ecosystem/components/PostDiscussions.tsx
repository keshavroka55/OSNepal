import { Link } from 'react-router-dom';
import { usePostFeed } from '../hooks/usePostFeed';

interface PostDiscussionsProps {
  /** Show posts linked to this launch. */
  startupId?: string;
  /** Or posts written by this person. */
  authorId?: string;
  title: string;
}

// Small list used on product pages ("Discussions about this product")
// and founder profiles. Renders nothing while loading or when empty.
export function PostDiscussions({ startupId, authorId, title }: PostDiscussionsProps) {
  const { posts, loading } = usePostFeed({ sort: 'top', limit: 5, startup: startupId, author: authorId });
  if (loading || posts.length === 0) return null;

  return (
    <section aria-labelledby="ecosystem-discussions" className="rounded-lg border border-border bg-surface p-4">
      <h2 id="ecosystem-discussions" className="text-base font-semibold">{title}</h2>
      <ul className="mt-2 divide-y divide-border">
        {posts.map((p) => (
          <li key={p.id} className="py-2">
            <Link to={`/ecosystem/s/${p.space.slug}/post/${p.id}`} className="text-sm font-medium hover:text-primary">{p.title}</Link>
            <p className="text-xs text-text-muted">
              {p.space.name} · <span className="tabular">{p.score}</span> points · <span className="tabular">{p.commentCount}</span> comments
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
