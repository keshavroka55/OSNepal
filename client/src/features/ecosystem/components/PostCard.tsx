import { Link } from 'react-router-dom';
import { Bookmark, ExternalLink, Flag, Lock, MessageSquare } from 'lucide-react';
import { useCallback, useState } from 'react';
import { savePost, votePost } from '../api/ecosystemApi';
import { useVote } from '../hooks/useVote';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { relativeTime } from '../relativeTime';
import type { Post, PostType } from '../types';
import { VoteButton } from './VoteButton';

const TYPE_LABEL: Record<PostType, string> = {
  IDEA: 'Idea', FEEDBACK: 'Feedback', DISCUSSION: 'Discussion', QUESTION: 'Question', SHOWCASE: 'Showcase', LINK: 'Link',
};

// Markdown to a short plain-text preview for the feed.
const preview = (markdown: string) =>
  markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links keep their text
    .replace(/^[#>\-*\s]+/gm, '') // heading, quote and list markers at line start
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

interface PostCardProps {
  post: Post;
  showSpace?: boolean;
  onReport?: (postId: string) => void;
}

export function PostCard({ post, showSpace = true, onReport }: PostCardProps) {
  const requireAuth = useRequireAuth();
  const [saved, setSaved] = useState(post.viewerSaved);

  const send = useCallback((value: -1 | 0 | 1) => votePost(post.id, value), [post.id]);
  const { score, viewerVote, vote } = useVote({ score: post.score, viewerVote: post.viewerVote }, send);

  const toggleSave = async () => {
    if (!requireAuth('save posts')) return;
    setSaved((s) => !s);
    try {
      setSaved((await savePost(post.id)).saved);
    } catch {
      setSaved((s) => !s);
    }
  };

  const href = `/ecosystem/s/${post.space.slug}/post/${post.id}`;
  const snippet = preview(post.body);
  const authorName = post.author.username ? `@${post.author.username}` : post.author.name;

  return (
    <article className="flex gap-2 border-b border-border px-1 py-3 sm:gap-3">
      <VoteButton
        score={score}
        viewerVote={viewerVote}
        label={`post "${post.title}"`}
        onVote={(d) => requireAuth('vote') && void vote(d)}
        disabled={post.status !== 'PUBLISHED'}
      />

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
          {showSpace && (
            <Link to={`/ecosystem/s/${post.space.slug}`} className="font-medium text-text hover:underline">
              {post.space.icon} {post.space.name}
            </Link>
          )}
          <span>{TYPE_LABEL[post.type]}</span>
          <span>
            by <Link to={`/profile/${post.author.id}`} className="hover:underline">{authorName}</Link>
          </span>
          <time dateTime={post.createdAt}>{relativeTime(post.createdAt)}</time>
          {post.status === 'LOCKED' && (
            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" /> Locked</span>
          )}
        </p>

        <h3 className="mt-1 text-base font-semibold leading-snug text-text">
          <Link to={href} className="hover:text-primary">{post.title}</Link>
        </h3>

        {snippet && <p className="mt-1 line-clamp-2 text-sm text-text-muted">{snippet}</p>}

        {post.linkUrl && (
          <a
            href={post.linkUrl}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{new URL(post.linkUrl).hostname}</span>
          </a>
        )}

        {post.startup && (
          <Link
            to={`/projects/${post.startup.slug}`}
            className="mt-2 flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5 text-sm hover:bg-surface-raised"
          >
            <img src={post.startup.logo} alt="" loading="lazy" className="h-6 w-6 rounded-sm object-cover" />
            <span className="font-medium">{post.startup.name}</span>
            <span className="truncate text-text-muted">{post.startup.tagline}</span>
          </Link>
        )}

        <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
          <Link
            to={href}
            className="inline-flex h-11 items-center gap-1.5 rounded-md px-2 hover:bg-surface-raised sm:h-8"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span className="tabular">{post.commentCount}</span>
            <span className="sr-only">comments</span>
          </Link>
          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            className={`inline-flex h-11 items-center gap-1.5 rounded-md px-2 hover:bg-surface-raised sm:h-8 ${saved ? 'text-primary' : ''}`}
          >
            <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
            {saved ? 'Saved' : 'Save'}
          </button>
          {onReport && (
            <button
              type="button"
              onClick={() => requireAuth('report content') && onReport(post.id)}
              className="inline-flex h-11 items-center gap-1.5 rounded-md px-2 hover:bg-surface-raised sm:h-8"
            >
              <Flag className="h-4 w-4" aria-hidden="true" />
              Report
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="flex gap-3 border-b border-border px-1 py-3" aria-hidden="true">
      <div className="h-16 w-7 animate-pulse rounded-md bg-surface-raised" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded-sm bg-surface-raised" />
        <div className="h-4 w-4/5 animate-pulse rounded-sm bg-surface-raised" />
        <div className="h-3 w-3/5 animate-pulse rounded-sm bg-surface-raised" />
      </div>
    </div>
  );
}
