import { api } from '../api/api';

const BASE = "/api/votes";

export const toggleVoteAPI = async (startupId: string) => {
  const res = await api.post(`${BASE}/${startupId}`);
  return res.data;
};

export const getVoteCountAPI = async (startupId: string) => {
  const res = await api.get(`${BASE}/${startupId}`);
  return res.data;
};

export const getMyVotedStartupsAPI = async () => {
  const res = await api.get(`${BASE}/my`);
  return res.data;
};