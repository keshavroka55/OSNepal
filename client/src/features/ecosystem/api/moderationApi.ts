import { api } from '../../api/api';
import type { Page } from '../types';

export interface QueueReport {
  id: string;
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reporter: { id: string; name: string; username: string | null };
  target: {
    id: string;
    title?: string; // posts
    body?: string; // comments
    postId?: string;
    status?: string;
    deletedAt?: string | null;
    space?: { slug: string };
    author: { id: string; name: string };
  } | null;
}

export const getReportQueue = async (status: QueueReport['status'], cursor?: string | null) =>
  (await api.get<Page<QueueReport>>('/api/reports', { params: { status, cursor: cursor ?? undefined } })).data;

export const resolveReport = async (id: string, status: 'RESOLVED' | 'DISMISSED', removeTarget: boolean) =>
  (await api.patch(`/api/reports/${id}`, { status, removeTarget })).data;
