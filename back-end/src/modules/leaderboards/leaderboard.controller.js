import * as LeaderboardService from './leaderboard.service.js';

export const GetDailyLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await LeaderboardService.getDailyLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetWeeklyLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await LeaderboardService.getWeeklyLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetMonthlyLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await LeaderboardService.getMonthlyLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetAllTimeLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await LeaderboardService.getAllTimeLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetFounderLeaderboard = async (req, res) => {
  try {
    const { type = 'MONTHLY', limit = 20 } = req.query;
    if (!['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be DAILY, WEEKLY, MONTHLY, or ALL_TIME' });
    }
    const leaderboard = await LeaderboardService.getFounderLeaderboard(type, parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const CalculateLeaderboard = async (req, res) => {
  try {
    const { type = 'DAILY' } = req.body;
    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be DAILY, WEEKLY, or MONTHLY' });
    }
    const result = await LeaderboardService.calculateLeaderboard(type);
    res.json({ message: `${type} leaderboard calculated`, count: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Kept for backwards compatibility
export const GetDaily = async (req, res) => {
  const { limit = 10 } = req.query;
  return GetDailyLeaderboard({ query: { limit } }, res);
};

export const GetWeekly = async (req, res) => {
  const { limit = 10 } = req.query;
  return GetWeeklyLeaderboard({ query: { limit } }, res);
};

export const GetMonthly = async (req, res) => {
  const { limit = 10 } = req.query;
  return GetMonthlyLeaderboard({ query: { limit } }, res);
};

const TYPES = ['STARTUP', 'OPEN_SOURCE', 'LEARNING', 'IDEA', 'HARDWARE'];
const PERIODS = ['daily', 'weekly', 'monthly', 'all'];

export const GetRankings = async (req, res) => {
  try {
    const { period = 'weekly', type, category, backed, limit = 20 } = req.query;
    if (!PERIODS.includes(period)) return res.status(400).json({ message: 'Invalid period' });
    if (type && !TYPES.includes(type)) return res.status(400).json({ message: 'Invalid type' });
    const data = await LeaderboardService.getRankings({
      period, type, category: category ? String(category).slice(0, 80) : undefined,
      backed: backed === undefined ? undefined : backed === 'true',
      limit: Math.min(parseInt(limit) || 20, 50),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
