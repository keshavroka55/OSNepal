export type PostType = 'IDEA' | 'FEEDBACK' | 'DISCUSSION' | 'QUESTION' | 'SHOWCASE' | 'LINK';
export type PostStatus = 'PUBLISHED' | 'REMOVED' | 'LOCKED';
export type SortKey = 'hot' | 'new' | 'top';
export type CommentSort = 'best' | 'new';
export type SpaceRole = 'MEMBER' | 'MODERATOR' | 'OWNER';
export type VoteValue = -1 | 0 | 1;

export interface AuthorLite {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  verified: boolean;
}

export interface SpaceLite {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
}

export interface Space extends SpaceLite {
  description: string;
  rules: string | null;
  isPrivate: boolean;
  memberCount: number;
  createdAt: string;
  viewerRole: SpaceRole | null;
  moderators?: (AuthorLite & { role: SpaceRole })[];
}

export interface StartupLite {
  id: string;
  name: string;
  slug: string;
  logo: string;
  tagline: string;
}

export interface Post {
  id: string;
  spaceId: string;
  type: PostType;
  title: string;
  body: string;
  linkUrl: string | null;
  score: number;
  commentCount: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  author: AuthorLite;
  space: SpaceLite;
  startup: StartupLite | null;
  tags: { name: string; slug: string }[];
  viewerVote: VoteValue;
  viewerSaved: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  body: string;
  author: AuthorLite | null; // null once deleted
  deleted: boolean;
  score: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  viewerVote: VoteValue;
  replies: PostComment[];
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface VoteResult {
  score: number;
  viewerVote: VoteValue;
}

export interface NewPostInput {
  spaceSlug: string;
  type: PostType;
  title: string;
  body: string;
  linkUrl?: string;
  startupId?: string;
  tags: string[];
}

export interface MyStartup {
  id: string;
  name: string;
  slug: string;
  logo: string;
  status: string;
}
