import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, Lock } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { notify } from '../../utils/notify';
import { deletePost, getPost, getSpace, moderatePost, savePost, votePost } from '../../features/ecosystem/api/ecosystemApi';
import { CommentThread } from '../../features/ecosystem/components/CommentThread';
import { Markdown } from '../../features/ecosystem/components/Markdown';
import { ReportDialog } from '../../features/ecosystem/components/ReportDialog';
import { VoteButton } from '../../features/ecosystem/components/VoteButton';
import { useRequireAuth } from '../../features/ecosystem/hooks/useRequireAuth';
import { useVote } from '../../features/ecosystem/hooks/useVote';
import { relativeTime } from '../../features/ecosystem/relativeTime';
import type { Post, Space } from '../../features/ecosystem/types';
import NotFoundPage from '../NotFoundPage';

function PostBody({ post, space, onChange }: { post: Post; space: Space | null; onChange: (p: Post) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();
  const [reporting, setReporting] = useState(false);

  const send = useCallback((v: -1 | 0 | 1) => votePost(post.id, v), [post.id]);
  const { score, viewerVote, vote } = useVote({ score: post.score, viewerVote: post.viewerVote }, send);

  const isModerator = space?.viewerRole === 'MODERATOR' || space?.viewerRole === 'OWNER' || user?.role === 'admin';
  const canDelete = user?.id === post.author.id || isModerator;

  const moderate = async (action: 'remove' | 'lock' | 'unlock') => {
    try {
      const { status } = await moderatePost(post.id, action);
      if (action === 'remove') { notify.success('Post removed.'); navigate(`/ecosystem/s/${post.space.slug}`); return; }
      onChange({ ...post, status: status as Post['status'] });
    } catch {
      notify.error("Couldn't do that.");
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try { await deletePost(post.id); navigate(`/ecosystem/s/${post.space.slug}`); } catch { notify.error("Couldn't delete the post."); }
  };

  const save = async () => {
    if (!requireAuth('save posts')) return;
    try { onChange({ ...post, viewerSaved: (await savePost(post.id)).saved }); } catch { notify.error("Couldn't save."); }
  };

  return (
    <article>
      <div className="flex gap-3">
        <VoteButton score={score} viewerVote={viewerVote} label="this post" onVote={(d) => requireAuth('vote') && void vote(d)} disabled={post.status !== 'PUBLISHED'} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-muted">
            <Link to={`/ecosystem/s/${post.space.slug}`} className="font-medium text-text hover:underline">{post.space.icon} {post.space.name}</Link>
            {' · '}by <Link to={`/profile/${post.author.id}`} className="hover:underline">{post.author.username ? `@${post.author.username}` : post.author.name}</Link>
            {' · '}<time dateTime={post.createdAt}>{relativeTime(post.createdAt)}</time>
            {post.status === 'LOCKED' && <span className="ml-2 inline-flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" />Locked</span>}
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight">{post.title}</h1>

          {post.linkUrl && (
            <a href={post.linkUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> {new URL(post.linkUrl).hostname}
            </a>
          )}

          {post.body && <div className="mt-4"><Markdown>{post.body}</Markdown></div>}

          {post.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
              {post.tags.map((t) => <li key={t.slug} className="rounded-sm bg-surface-raised px-2 py-0.5 text-xs text-text-muted">#{t.name}</li>)}
            </ul>
          )}

          {post.startup && (
            <Link to={`/products/${post.startup.slug}`} className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-surface-raised">
              <img src={post.startup.logo} alt="" className="h-10 w-10 rounded-md object-cover" />
              <span><span className="block font-medium">{post.startup.name}</span><span className="block text-sm text-text-muted">{post.startup.tagline}</span></span>
            </Link>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1 text-sm text-text-muted">
            <Button variant="ghost" size="sm" onClick={save} aria-pressed={post.viewerSaved}>{post.viewerSaved ? 'Saved' : 'Save'}</Button>
            {user?.id !== post.author.id && <Button variant="ghost" size="sm" onClick={() => requireAuth('report content') && setReporting(true)}>Report</Button>}
            {canDelete && <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>}
            {isModerator && (
              <>
                <Button variant="ghost" size="sm" onClick={() => moderate(post.status === 'LOCKED' ? 'unlock' : 'lock')}>{post.status === 'LOCKED' ? 'Unlock' : 'Lock'}</Button>
                <Button variant="ghost" size="sm" onClick={() => moderate('remove')}>Remove</Button>
              </>
            )}
          </div>
        </div>
      </div>
      <ReportDialog target={reporting ? { type: 'POST', id: post.id } : null} onClose={() => setReporting(false)} />
    </article>
  );
}

export default function PostPage() {
  const { postId = '' } = useParams();
  const { socket } = useSocket();
  const [post, setPost] = useState<Post | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [missing, setMissing] = useState(false);
  const [reportingComment, setReportingComment] = useState<string | null>(null);

  useEffect(() => {
    setPost(null); setMissing(false);
    getPost(postId).then((p) => { setPost(p); return getSpace(p.space.slug).then(setSpace).catch(() => setSpace(null)); }).catch(() => setMissing(true));
  }, [postId]);

  // Live comment count through the existing Socket.io connection (signed-in users).
  useEffect(() => {
    if (!socket || !postId) return;
    const onCount = (data: { postId: string; commentCount: number }) => {
      if (data.postId === postId) setPost((p) => (p ? { ...p, commentCount: data.commentCount } : p));
    };
    socket.emit('post:join', postId);
    socket.on('post:commentCount', onCount);
    return () => { socket.emit('post:leave', postId); socket.off('post:commentCount', onCount); };
  }, [socket, postId]);

  if (missing) return <NotFoundPage />;

  return (
    <>
      <SEO title={post?.title ?? 'Post'} description={post?.body.slice(0, 160)} url={post ? `/ecosystem/s/${post.space.slug}/post/${post.id}` : undefined} type="article" />
      <main className="mx-auto w-full max-w-3xl px-4 pb-6 pt-0">
        {!post ? (
          <div className="space-y-3" aria-busy="true"><div className="h-8 w-2/3 animate-pulse rounded-md bg-surface-raised" /><div className="h-40 animate-pulse rounded-md bg-surface-raised" /></div>
        ) : (
          <>
            <PostBody post={post} space={space} onChange={setPost} />
            <p className="mt-6 text-sm text-text-muted"><span className="tabular font-medium text-text">{post.commentCount}</span> {post.commentCount === 1 ? 'comment' : 'comments'}</p>
            <CommentThread
              postId={post.id}
              locked={post.status === 'LOCKED'}
              canModerate={space?.viewerRole === 'MODERATOR' || space?.viewerRole === 'OWNER'}
              onReport={setReportingComment}
            />
            <ReportDialog target={reportingComment ? { type: 'COMMENT', id: reportingComment } : null} onClose={() => setReportingComment(null)} />
          </>
        )}
      </main>
    </>
  );
}
