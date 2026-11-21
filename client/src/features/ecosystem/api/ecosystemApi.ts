import { api } from '../../api/api';
import type {
  CommentSort, MyStartup, NewPostInput, Page, Post, PostComment, SortKey, Space, VoteResult, VoteValue,
} from '../types';

export interface FeedParams {
  sort: SortKey;
  cursor?: string | null;
  space?: string;
  author?: string;
  startup?: string;
  type?: string;
  limit?: number;
}

// Spaces
export const listSpaces = async () => (await api.get<Space[]>('/api/spaces')).data;
export const getSpace = async (slug: string) => (await api.get<Space>(`/api/spaces/${slug}`)).data;
export const joinSpace = async (slug: string) =>
  (await api.post<{ joined: boolean; memberCount: number }>(`/api/spaces/${slug}/join`)).data;
export const leaveSpace = async (slug: string) =>
  (await api.delete<{ joined: boolean; memberCount: number }>(`/api/spaces/${slug}/join`)).data;

// Posts
export const getFeed = async ({ cursor, ...params }: FeedParams) =>
  (await api.get<Page<Post>>('/api/posts', { params: { ...params, cursor: cursor ?? undefined } })).data;
export const getPost = async (id: string) => (await api.get<Post>(`/api/posts/${id}`)).data;
export const createPost = async (input: NewPostInput) => (await api.post<Post>('/api/posts', input)).data;
export const deletePost = async (id: string) => (await api.delete(`/api/posts/${id}`)).data;
export const votePost = async (id: string, value: VoteValue) =>
  (await api.post<VoteResult>(`/api/posts/${id}/vote`, { value })).data;
export const savePost = async (id: string) =>
  (await api.post<{ saved: boolean }>(`/api/posts/${id}/save`)).data;
export const moderatePost = async (id: string, action: 'remove' | 'restore' | 'lock' | 'unlock') =>
  (await api.post<{ status: string }>(`/api/posts/${id}/moderate`, { action })).data;

// Comments
export const listComments = async (postId: string, sort: CommentSort, cursor?: string | null) =>
  (await api.get<Page<PostComment>>(`/api/post-comments/post/${postId}`, {
    params: { sort, cursor: cursor ?? undefined },
  })).data;
export const listReplies = async (commentId: string, sort: CommentSort) =>
  (await api.get<{ items: PostComment[] }>(`/api/post-comments/${commentId}/replies`, { params: { sort } })).data;
export const createComment = async (postId: string, body: string, parentId?: string) =>
  (await api.post<PostComment>(`/api/post-comments/post/${postId}`, { body, parentId })).data;
export const deleteComment = async (id: string) => (await api.delete(`/api/post-comments/${id}`)).data;
export const voteComment = async (id: string, value: VoteValue) =>
  (await api.post<VoteResult>(`/api/post-comments/${id}/vote`, { value })).data;

// Reports and uploads
export const createReport = async (targetType: 'POST' | 'COMMENT', targetId: string, reason: string) =>
  (await api.post('/api/reports', { targetType, targetId, reason })).data;

export const uploadPostImage = async (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return (await api.post<{ url: string }>('/api/media/post-image', form)).data.url;
};

export const getMyStartups = async () => (await api.get<MyStartup[]>('/api/startups/mine')).data;
