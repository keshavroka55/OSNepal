import { api } from '../api/api';
import type {
  BadgeDef, Category, Contribution, InterestRow, JoinRequest, NotificationItem, Paged, Person, Project,
  ProjectType, PublicProfile, Ranking,
} from './types';

const get = async <T>(url: string, params?: object) => (await api.get<T>(url, { params })).data;

// Projects
export interface ProjectQuery {
  page?: number; limit?: number; search?: string; category?: string; type?: string; stage?: string;
  lookingFor?: string; backed?: boolean; sort?: 'new' | 'top';
}
export const listProjects = (q: ProjectQuery = {}) => get<Paged<Project>>('/api/startups', q);
export const getProject = (slug: string) => get<Project>(`/api/startups/slug/${slug}`);
export const myProjects = () => get<Pick<Project, 'id' | 'name' | 'slug' | 'logo' | 'status' | 'type'>[]>('/api/startups/mine');
export const createProject = async (body: Record<string, unknown>) => (await api.post<Project>('/api/startups', body)).data;
export const updateProject = async (id: string, body: Record<string, unknown>) => (await api.put<Project>(`/api/startups/${id}`, body)).data;
export const deleteProject = async (id: string) => (await api.delete(`/api/startups/${id}`)).data;
export const listCategories = () => get<Category[]>('/api/categories');

// Likes, saves, comments
export const toggleLike = async (id: string) => (await api.post<{ voted: boolean }>(`/api/votes/${id}`)).data;
export const toggleSave = async (id: string) => (await api.post<{ bookmarked: boolean }>(`/api/bookmarks/${id}`)).data;
export const mySaved = () => get<{ id: string; startup: Project }[]>('/api/bookmarks/my');
export const listComments = (startupId: string) => get<ProjectComment[]>(`/api/comments/startup/${startupId}`);
export const addComment = async (startupId: string, content: string, parentId?: string) =>
  (await api.post(`/api/comments/startup/${startupId}`, { content, parentId })).data;
type ProjectComment = import('./types').ProjectComment;

// Join requests
export const sendJoinRequest = async (body: { startupId: string; roleWanted: string; message: string }) =>
  (await api.post<JoinRequest>('/api/join-requests', body)).data;
export const sentRequests = () => get<JoinRequest[]>('/api/join-requests/sent');
export const receivedRequests = () => get<JoinRequest[]>('/api/join-requests/received');
export const respondToRequest = async (id: string, status: 'ACCEPTED' | 'REJECTED') =>
  (await api.patch(`/api/join-requests/${id}/respond`, { status })).data;
export const withdrawRequest = async (id: string) => (await api.delete(`/api/join-requests/${id}`)).data;

// Contributions
export const userContributions = (userId: string) => get<Contribution[]>(`/api/contributions/user/${userId}`);
export const projectContributions = (id: string) => get<Contribution[]>(`/api/contributions/project/${id}`);
export const addContribution = async (body: { startupId: string; title: string; description?: string; url?: string }) =>
  (await api.post<Contribution>('/api/contributions', body)).data;
export const verifyContribution = async (id: string) => (await api.patch(`/api/contributions/${id}/verify`)).data;
export const removeContribution = async (id: string) => (await api.delete(`/api/contributions/${id}`)).data;

// People, badges, notifications
export interface PeopleQuery { q?: string; skill?: string; role?: string; location?: string; page?: number }
export const listPeople = (q: PeopleQuery = {}) => get<{ items: Person[]; pagination: Paged<Person>['pagination'] }>('/api/people', q);
export const topPeople = (limit = 10) => get<Person[]>('/api/people/top', { limit });
export const popularSkills = () => get<{ skill: string; count: number }[]>('/api/people/skills');
export const mySummary = () => get<{ projects: number; memberships: number; pendingRequests: number; unread: number }>('/api/people/me/summary');
export const profileByUsername = (u: string) => get<PublicProfile>(`/api/users/username/${u}`);
export const profileById = (id: string) => get<PublicProfile>(`/api/users/${id}`);
export const myProfile = () => get<PublicProfile>('/api/users/me');
export const saveProfile = async (body: Record<string, unknown>) => (await api.put<Person>('/api/users/me', body)).data;
export const completeOnboarding = async (body: Record<string, unknown>) => (await api.put<Person>('/api/users/me/onboarding', body)).data;
export const badgeCatalog = () => get<BadgeDef[]>('/api/badges');
export const myBadges = () => get<BadgeDef[]>('/api/badges/me');
export const sendConnection = async (receiverId: string) => (await api.post('/api/connections/request', { receiverId })).data;

export const listNotifications = () => get<{ items: NotificationItem[]; unread: number }>('/api/notifications');
export const unreadCount = () => get<{ unread: number }>('/api/notifications/unread-count');
export const markAllRead = async () => (await api.post('/api/notifications/read-all')).data;
export const markRead = async (id: string) => (await api.patch(`/api/notifications/${id}/read`)).data;

// Leaderboard
export interface RankQuery { period?: 'daily' | 'weekly' | 'monthly' | 'all'; type?: ProjectType | ''; category?: string; backed?: boolean; limit?: number }
export const rankings = (q: RankQuery = {}) => get<Ranking[]>('/api/leaderboards/rankings', { ...q, type: q.type || undefined });

// Investors
export const dealFlow = (q: Record<string, unknown> = {}) => get<{ items: (Project & { _count: { members: number; joinRequests: number } })[]; pagination: Paged<Project>['pagination'] }>('/api/investors/deal-flow', q);
export const requestInvestorMark = async (startupId: string, note?: string) => (await api.post('/api/investors/interest', { startupId, note })).data;
export const myInterests = () => get<InterestRow[]>('/api/investors/interest/mine');
export const markQueue = (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') => get<InterestRow[]>('/api/investors/admin/queue', { status });
export const reviewMark = async (id: string, status: 'APPROVED' | 'REJECTED') => (await api.patch(`/api/investors/admin/${id}`, { status })).data;
export const revokeMark = async (startupId: string) => (await api.delete(`/api/investors/admin/mark/${startupId}`)).data;
export const verifyUser = async (id: string, verified = true) => (await api.patch(`/api/admin/users/${id}/verify`, { verified })).data;

// Admin
export interface AdminStats {
  summary: Record<string, number>;
  recentProjects: Pick<Project, 'id' | 'name' | 'slug' | 'tagline' | 'logo' | 'status' | 'totalVotes' | 'totalComments' | 'createdAt' | 'founder' | 'category'>[];
  projectsByType: { type: ProjectType; count: number }[];
}
export const adminStats = () => get<AdminStats>('/api/admin/dashboard');

export const errMsg = (e: unknown, fallback = 'Something went wrong') => {
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
};
