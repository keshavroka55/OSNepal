import type { PostType } from './types';

type SpaceHint = { slug: string; label: string };

// Which space each post type belongs in by default.
// DISCUSSION and LINK fit anywhere, so they have no default.
export const POST_TYPE_SPACE: Record<PostType, SpaceHint | null> = {
  IDEA: { slug: 'ideas', label: 'Ideas' },
  FEEDBACK: { slug: 'feedback', label: 'Feedback' },
  QUESTION: { slug: 'learn-and-contribute', label: 'Learn & Contribute' },
  SHOWCASE: { slug: 'build-in-public', label: 'Build in Public' },
  DISCUSSION: null,
  LINK: null,
};

const isPostType = (v: string): v is PostType => v in POST_TYPE_SPACE;

export const suggestedSpace = (type?: string | null): SpaceHint | undefined => {
  const t = type?.toUpperCase();
  return t && isPostType(t) ? POST_TYPE_SPACE[t] ?? undefined : undefined;
};