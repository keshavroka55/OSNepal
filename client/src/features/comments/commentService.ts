import { api } from '../api/api';

const BASE = "/api/comments";

export const getCommentsAPI = async (startupId: string) => {
  const res = await api.get(`${BASE}/startup/${startupId}`);
  return res.data;
};

export const createCommentAPI = async (startupId: string, text: string, parentId?: string) => {
  const res = await api.post(`${BASE}/startup/${startupId}`, { content: text, parentId });
  return res.data;
};

export const updateCommentAPI = async (id: string, text: string) => {
  const res = await api.put(`${BASE}/${id}`, { content: text });
  return res.data;
};

export const deleteCommentAPI = async (id: string) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const getMyCommentsAPI = async () => {
  const res = await api.get(`/api/comments/my`);
  return res.data;
};