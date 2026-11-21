import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Flag, Reply, Trash2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { notify } from '../../../utils/notify';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import {
  createComment, deleteComment, listComments, listReplies, voteComment,
} from '../api/ecosystemApi';
import { addReply, markDeleted, setReplies } from '../commentTree';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useVote } from '../hooks/useVote';
import { relativeTime } from '../relativeTime';
import type { CommentSort, PostComment } from '../types';
import { Markdown } from './Markdown';
import { SortTabs } from './SortTabs';
import { VoteButton } from './VoteButton';

interface ThreadContext {
  postId: string;
  locked: boolean;
  canModerate: boolean;
  sort: CommentSort;
  onReply: (parentId: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLoadReplies: (id: string) => Promise<void>;
  onReport: (commentId: string) => void;
}

function CommentForm({ placeholder, submitLabel, onSubmit, onCancel }: {
  placeholder: string; submitLabel: string; onSubmit: (body: string) => Promise<void>; onCancel?: () => void;
}) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await onSubmit(body.trim());
      setBody('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={10000}
        rows={3}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void submit(); }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={submit} disabled={sending || !body.trim()}>
          {sending ? 'Posting...' : submitLabel}
        </Button>
        {onCancel && <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <span className="hidden text-xs text-text-muted sm:inline">Markdown supported. Ctrl+Enter to post.</span>
      </div>
    </div>
  );
}

function CommentItem({ comment, ctx }: { comment: PostComment; ctx: ThreadContext }) {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const send = useCallback((v: -1 | 0 | 1) => voteComment(comment.id, v), [comment.id]);
  const { score, viewerVote, vote } = useVote({ score: comment.score, viewerVote: comment.viewerVote }, send);

  const isOwn = Boolean(user && comment.author && user.id === comment.author.id);
  const hiddenReplies = comment.replyCount - comment.replies.length;
  const name = comment.author?.username ? `@${comment.author.username}` : comment.author?.name;

  const loadMore = async () => {
    setLoadingReplies(true);
    try { await ctx.onLoadReplies(comment.id); } finally { setLoadingReplies(false); }
  };

  return (
    <li className="pt-3">
      <div className="flex gap-1 sm:gap-2">
        {!comment.deleted && (
          <VoteButton
            score={score}
            viewerVote={viewerVote}
            label="comment"
            orientation="vertical"
            onVote={(d) => requireAuth('vote') && void vote(d)}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand comment thread' : 'Collapse comment thread'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-raised sm:h-6 sm:w-6"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            {comment.author ? (
              <Link to={`/profile/${comment.author.id}`} className="font-medium text-text hover:underline">{name}</Link>
            ) : (
              <span>[deleted]</span>
            )}
            <time dateTime={comment.createdAt}>{relativeTime(comment.createdAt)}</time>
            {collapsed && comment.replyCount > 0 && <span>{comment.replyCount} hidden</span>}
          </div>

          {!collapsed && (
            <>
              <div className="mt-1">
                {comment.deleted ? <p className="text-sm italic text-text-muted">This comment was deleted.</p> : <Markdown>{comment.body}</Markdown>}
              </div>

              {!comment.deleted && (
                <div className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                  {!ctx.locked && (
                    <button
                      type="button"
                      onClick={() => requireAuth('reply') && setReplying((r) => !r)}
                      className="inline-flex h-11 items-center gap-1 rounded-md px-2 hover:bg-surface-raised sm:h-7"
                    >
                      <Reply className="h-3.5 w-3.5" aria-hidden="true" /> Reply
                    </button>
                  )}
                  {(isOwn || ctx.canModerate) && (
                    <button
                      type="button"
                      onClick={() => void ctx.onDelete(comment.id)}
                      className="inline-flex h-11 items-center gap-1 rounded-md px-2 hover:bg-surface-raised sm:h-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                    </button>
                  )}
                  {!isOwn && (
                    <button
                      type="button"
                      onClick={() => requireAuth('report content') && ctx.onReport(comment.id)}
                      className="inline-flex h-11 items-center gap-1 rounded-md px-2 hover:bg-surface-raised sm:h-7"
                    >
                      <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Report
                    </button>
                  )}
                </div>
              )}

              {replying && (
                <div className="mt-2">
                  <CommentForm
                    placeholder={`Reply to ${name ?? 'this comment'}`}
                    submitLabel="Reply"
                    onCancel={() => setReplying(false)}
                    onSubmit={async (body) => { await ctx.onReply(comment.id, body); setReplying(false); }}
                  />
                </div>
              )}

              {comment.replies.length > 0 && (
                <ul className="mt-1 border-l border-border pl-2 sm:pl-3">
                  {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} ctx={ctx} />)}
                </ul>
              )}

              {hiddenReplies > 0 && (
                <Button variant="ghost" size="sm" className="mt-1" onClick={loadMore} disabled={loadingReplies}>
                  {loadingReplies ? 'Loading...' : `Load ${hiddenReplies} more ${hiddenReplies === 1 ? 'reply' : 'replies'}`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

interface CommentThreadProps {
  postId: string;
  locked: boolean;
  canModerate: boolean;
  onReport: (commentId: string) => void;
}

export function CommentThread({ postId, locked, canModerate, onReport }: CommentThreadProps) {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const [sort, setSort] = useState<CommentSort>('best');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    listComments(postId, sort)
      .then((page) => {
        if (cancelled) return;
        setComments(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [postId, sort]);

  const loadMoreRoots = async () => {
    if (!nextCursor) return;
    const page = await listComments(postId, sort, nextCursor);
    setComments((c) => [...c, ...page.items]);
    setNextCursor(page.nextCursor);
  };

  const submitTop = async (body: string) => {
    try {
      const created = await createComment(postId, body);
      setComments((c) => [created, ...c]);
    } catch (err: unknown) {
      notify.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Couldn't post your comment.");
      throw err;
    }
  };

  const ctx: ThreadContext = {
    postId, locked, canModerate, sort, onReport,
    onReply: async (parentId, body) => {
      try {
        const created = await createComment(postId, body, parentId);
        setComments((c) => addReply(c, parentId, created));
      } catch (err: unknown) {
        notify.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Couldn't post your reply.");
        throw err;
      }
    },
    onDelete: async (id) => {
      if (!window.confirm('Delete this comment?')) return;
      try {
        await deleteComment(id);
        setComments((c) => markDeleted(c, id));
      } catch {
        notify.error("Couldn't delete the comment.");
      }
    },
    onLoadReplies: async (id) => {
      const { items } = await listReplies(id, sort);
      setComments((c) => setReplies(c, id, items));
    },
  };

  return (
    <section aria-labelledby="comments-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="comments-heading" className="text-base font-semibold">Comments</h2>
        <SortTabs
          value={sort}
          onChange={setSort}
          label="Sort comments"
          options={[{ value: 'best', label: 'Best' }, { value: 'new', label: 'Newest' }]}
        />
      </div>

      {locked ? (
        <p className="rounded-md border border-border bg-surface p-3 text-sm text-text-muted">
          This thread is locked. You can still read it, but new comments are turned off.
        </p>
      ) : (
        user ? (
          <CommentForm placeholder="Add a comment" submitLabel="Comment" onSubmit={submitTop} />
        ) : (
          <Button variant="outline" onClick={() => requireAuth('comment')}>Sign in to comment</Button>
        )
      )}

      {loading && (
        <div className="mt-4 space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-md bg-surface-raised" />)}
        </div>
      )}

      {error && !loading && (
        <p className="mt-4 text-sm text-danger" role="alert">Couldn't load comments. Refresh to try again.</p>
      )}

      {!loading && !error && comments.length === 0 && (
        <p className="mt-6 text-sm text-text-muted">No comments yet. Start the conversation.</p>
      )}

      {!loading && comments.length > 0 && (
        <ul className="mt-2">
          {comments.map((c) => <CommentItem key={c.id} comment={c} ctx={ctx} />)}
        </ul>
      )}

      {nextCursor && !loading && (
        <Button variant="outline" size="sm" className="mt-4" onClick={loadMoreRoots}>Load more comments</Button>
      )}
    </section>
  );
}
