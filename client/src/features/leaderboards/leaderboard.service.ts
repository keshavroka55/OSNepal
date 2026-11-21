import { api } from '../api/api';
import type { LeaderboardEntry } from "./leaderboard.type";

const BASE = "/api/leaderboards";

export const getDailyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await api.get(`${BASE}/daily`);
  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error("Invalid leaderboard response format");
  }
  return data;
};

export const getWeeklyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await api.get(`${BASE}/weekly`);
  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error("Invalid leaderboard response format");
  }
  return data;
};

export const getMonthlyLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await api.get(`${BASE}/monthly`);
  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error("Invalid leaderboard response format");
  }
  return data;
};

export const getAllTimeLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await api.get(`${BASE}/all-time`);
  const data = res.data;
  if (!Array.isArray(data)) {
    throw new Error("Invalid leaderboard response format");
  }
  return data;
};

export const getFoundersLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await api.get(`${BASE}/founders`);
  if (!Array.isArray(res.data)) throw new Error("Failed to fetch founders leaderboard");
  return res.data;
};

/**
 * Admin-only endpoint to trigger leaderboard calculation.
 * Requires valid authentication cookie.
 */
export const calculateLeaderboard = async (): Promise<{ message: string }> => {
  const res = await api.post(`${BASE}/calculate`);
  return res.data;
};