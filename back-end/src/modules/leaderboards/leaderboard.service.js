import prisma from '../../prisma.js';

const getLeaderboardInclude = () => ({
  startup: {
    include: {
      founder: { select: { id: true, name: true, avatar: true, verified: true } },
      category: { select: { id: true, name: true, slug: true } },
      votes: { select: { id: true } },
      comments: { select: { id: true } },
    },
  },
});

const buildFallbackLeaderboard = async (limit = 20) => {
  const startups = await prisma.startup.findMany({
    where: { status: 'published' },
    include: {
      founder: { select: { id: true, name: true, avatar: true, verified: true } },
      category: { select: { id: true, name: true, slug: true } },
      votes: { select: { id: true } },
      comments: { select: { id: true } },
    },
    orderBy: [{ totalVotes: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return startups.map((startup, index) => ({
    id: `fallback-${startup.id}`,
    startupId: startup.id,
    type: 'DAILY',
    rank: index + 1,
    score: startup.totalVotes || startup.votes.length || 0,
    calculatedAt: new Date().toISOString(),
    startup,
  }));
};

/**
 * Calculate and update leaderboard rankings
 * @param {string} type - 'DAILY', 'WEEKLY', or 'MONTHLY'
 */
export const calculateLeaderboard = async (type = 'DAILY') => {
  const now = new Date();
  let startDate;

  if (type === 'DAILY') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (type === 'WEEKLY') {
    const day = now.getDay();
    const diff = now.getDate() - day;
    startDate = new Date(now.getFullYear(), now.getMonth(), diff);
  } else if (type === 'MONTHLY') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Get startups with votes created after startDate
  const startups = await prisma.vote.groupBy({
    by: ['startupId'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  // Clear existing leaderboard entries for this type
  await prisma.leaderboard.deleteMany({
    where: { type },
  });

  // Create new leaderboard entries
  const leaderboardData = await Promise.all(
    startups.map((entry, index) =>
      prisma.leaderboard.create({
        data: {
          startupId: entry.startupId,
          type,
          rank: index + 1,
          score: entry._count.id,
        },
      })
    )
  );

  // Update startup ranks
  await Promise.all(
    leaderboardData.map((entry) => {
      const updateField = type === 'DAILY' ? 'dailyRank' : type === 'WEEKLY' ? 'weeklyRank' : 'monthlyRank';
      return prisma.startup.update({
        where: { id: entry.startupId },
        data: { [updateField]: entry.rank },
      });
    })
  );

  return leaderboardData;
};

/**
 * Get leaderboard for a specific type
 * @param {string} type - 'DAILY', 'WEEKLY', or 'MONTHLY'
 * @param {number} limit - Number of top entries to return
 */
export const getLeaderboard = async (type = 'DAILY', limit = 20) => {
  const leaderboard = await prisma.leaderboard.findMany({
    where: { type },
    include: getLeaderboardInclude(),
    orderBy: { rank: 'asc' },
    take: limit,
  });

  if (leaderboard.length > 0) {
    return leaderboard;
  }

  return buildFallbackLeaderboard(limit);
};

/**
 * Get top startups for the day
 */
export const getDailyLeaderboard = async (limit = 10) => {
  return getLeaderboard('DAILY', limit);
};

/**
 * Get top startups for the week
 */
export const getWeeklyLeaderboard = async (limit = 10) => {
  return getLeaderboard('WEEKLY', limit);
};

/**
 * Get top startups for the month
 */
export const getMonthlyLeaderboard = async (limit = 10) => {
  return getLeaderboard('MONTHLY', limit);
};

/**
 * Get leaderboard across all time using total votes.
 */
export const getAllTimeLeaderboard = async (limit = 20) => {
  const startups = await prisma.startup.findMany({
    where: { status: 'published' },
    include: {
      founder: { select: { id: true, name: true, avatar: true, verified: true } },
      category: { select: { id: true, name: true, slug: true } },
      votes: { select: { id: true } },
      comments: { select: { id: true } },
    },
    orderBy: [{ totalVotes: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return startups.map((startup, index) => ({
    id: `all-time-${startup.id}`,
    startupId: startup.id,
    type: 'ALL_TIME',
    rank: index + 1,
    score: startup.totalVotes || startup.votes.length || 0,
    calculatedAt: startup.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    startup,
  }));
};

/**
 * Founder rankings: owners ordered by the likes their projects earned.
 */
export const getFounderLeaderboard = async (type = 'MONTHLY', limit = 20) => {
  const rows = await prisma.startup.groupBy({
    by: ['founderId'],
    where: { status: 'published' },
    _sum: { totalVotes: true },
    _count: { id: true },
    orderBy: { _sum: { totalVotes: 'desc' } },
    take: limit,
  });
  const users = await prisma.user.findMany({
    where: { id: { in: rows.map((r) => r.founderId) } },
    select: { id: true, name: true, username: true, avatar: true, headline: true, verified: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return rows.map((r, i) => ({ rank: i + 1, founder: byId.get(r.founderId), score: r._sum.totalVotes ?? 0, projects: r._count.id }));
};

const PERIOD_START = {
  daily: () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; },
  weekly: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; },
  monthly: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d; },
  all: () => null,
};

/**
 * Leaderboard with filters: period + project type + category + investor mark.
 * Score = likes received in the period (all-time = total likes), ties broken
 * by comments then age. Projects with no likes in the period still appear
 * after those that have some, so the board is never empty on a quiet day.
 */
export const getRankings = async ({ period = 'weekly', type, category, backed, limit = 20 } = {}) => {
  const base = {
    status: 'published',
    ...(type && { type }),
    ...(category && { category: { slug: category } }),
    ...(backed !== undefined && { investorBacked: backed }),
  };
  const since = (PERIOD_START[period] || PERIOD_START.weekly)();

  let scores = new Map();
  if (since) {
    const grouped = await prisma.vote.groupBy({
      by: ['startupId'],
      where: { createdAt: { gte: since }, startup: base },
      _count: { id: true },
    });
    scores = new Map(grouped.map((g) => [g.startupId, g._count.id]));
  }

  const startups = await prisma.startup.findMany({
    where: base,
    select: {
      id: true, name: true, slug: true, tagline: true, logo: true, type: true, stage: true,
      totalVotes: true, totalComments: true, investorBacked: true, lookingFor: true, createdAt: true,
      category: { select: { id: true, name: true, slug: true } },
      founder: { select: { id: true, name: true, username: true, avatar: true, verified: true } },
      _count: { select: { members: true } },
    },
    orderBy: [{ totalVotes: 'desc' }, { totalComments: 'desc' }, { createdAt: 'asc' }],
    take: 200,
  });

  return startups
    .map((s) => ({ ...s, score: since ? (scores.get(s.id) ?? 0) : s.totalVotes }))
    .sort((a, b) => b.score - a.score || b.totalVotes - a.totalVotes || b.totalComments - a.totalComments)
    .slice(0, limit)
    .map((s, i) => ({ rank: i + 1, ...s }));
};

/**
 * Get startup score for a date range
 */
export const getStartupScoreInRange = async (startupId, startDate, endDate) => {
  const votes = await prisma.vote.count({
    where: {
      startupId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return votes;
};
