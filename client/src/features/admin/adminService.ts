import { api } from '../api/api';

const BASE = "/api/admin";

export type AdminDashboardStats = {
  summary: {
    totalUsers: number;
    totalProjects: number;
    totalLikes: number;
    totalComments: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    logo?: string | null;
    status: string;
    totalVotes: number;
    totalComments: number;
    createdAt: string;
    founder?: {
      id: string;
      name: string;
      username: string;
      avatar?: string | null;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  permissions: {
    canUpdateProjects: boolean;
    canDeleteProjects: boolean;
    canManageUsers: boolean;
  };
};

export const getDashboardStatsAPI = async (): Promise<AdminDashboardStats> => {
  const res = await api.get(`${BASE}/dashboard`);
  return res.data;
};