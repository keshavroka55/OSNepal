import { api } from '../api/api';

const BASE = "/api/bookmarks";

export const toggleBookmarkAPI = async (startupId: string, collection?: string, notes?: string) => {
  const res = await api.post(`${BASE}/${startupId}`, { collection, notes });
  return res.data;
};

export const getMyBookmarksAPI = async () => {
  const res = await api.get(`${BASE}/my`);
  return res.data;
};

export const checkIsBookmarkedAPI = async (startupId: string) => {
  const res = await api.get(`${BASE}/${startupId}/check`);
  return res.data;
};