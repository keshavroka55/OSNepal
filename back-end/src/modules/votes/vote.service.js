import prisma from '../../prisma.js';
import { calculateLeaderboard } from '../leaderboards/leaderboard.service.js';

import { invalidateStartupCaches } from '../../middleware/cacheAside.js';
import { addReputationPoints } from '../users/user.service.js';
import { notify } from '../notifications/notification.service.js';
import { evaluateBadges } from '../badges/badge.service.js';

const recalculateLeaderboardsInBackground = () => {
  Promise.all([
    calculateLeaderboard('DAILY'),
    calculateLeaderboard('WEEKLY'),
    calculateLeaderboard('MONTHLY'),
  ]).catch((error) => {
    console.error('Leaderboard recalculation failed:', error?.message || error);
  });
};

export const toggleVote = async (userId, startupId) => {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error('Startup not found');

  const existing = await prisma.vote.findUnique({
    where: { userId_startupId: { userId, startupId } },
  });

  if (existing) {
    await prisma.vote.delete({ where: { userId_startupId: { userId, startupId } } });
    // decrement totalVotes
    await prisma.startup.update({
      where: { id: startupId },
      data: { totalVotes: { decrement: 1 } },
    });
    addReputationPoints(startup.founderId, -2).catch(() => {});
    await invalidateStartupCaches({ id: startup.id, slug: startup.slug });
    recalculateLeaderboardsInBackground();
    return { voted: false, message: 'Vote removed' };
  } else {
    await prisma.vote.create({ data: { userId, startupId } });
    // increment totalVotes
    await prisma.startup.update({
      where: { id: startupId },
      data: { totalVotes: { increment: 1 } },
    });
    await invalidateStartupCaches({ id: startup.id, slug: startup.slug });
    recalculateLeaderboardsInBackground();
    addReputationPoints(startup.founderId, 2).catch(() => {});
    await notify({ userId: startup.founderId, actorId: userId, type: 'UPVOTE', startupId, message: `liked ${startup.name}`, link: `/projects/${startup.slug}` });
    evaluateBadges(startup.founderId);
    return { voted: true, message: 'Vote added' };
  }
};

export const getVoteCount = async (startupId) => {
  return prisma.vote.count({ where: { startupId } });
};

export const checkIsVoted = async (userId, startupId) => {
  const vote = await prisma.vote.findUnique({
    where: { userId_startupId: { userId, startupId } },
  });
  return !!vote;
};

export const getMyVotedStartups = async (userId) => {
  return prisma.vote.findMany({
    where: { userId },
    include: { startup: { include: { founder: true, category: true, votes: true, comments: true, bookmarks: true } } },
    orderBy: { createdAt: 'desc' },
  });
};
