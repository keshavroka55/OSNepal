import { api } from '../api/api';

const BASE = "/api/follows";

export const toggleFollowAPI = async (userId: string) => {
  const res = await api.post(`${BASE}/${userId}`);
  return res.data;
};

export const getFollowersAPI = async (userId: string) => {
  const res = await api.get(`${BASE}/${userId}/followers`);
  return res.data;
};

export const getFollowingAPI = async (userId: string) => {
  const res = await api.get(`${BASE}/${userId}/following`);
  return res.data;
};

export const checkIsFollowingAPI = async (userId: string) => {
  const res = await api.get(`${BASE}/${userId}/check`);
  return res.data;
};