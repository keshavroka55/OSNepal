import prisma from '../../prisma.js';
import { countOpenReports } from '../reports/report.service.js';

export const getDashboardStats = async () => {
  const [totalUsers, totalProjects, totalLikes, totalComments, openReports, totalPosts, recentProjects, developers, investors, pendingMarks, backedProjects, joinRequests, byType] = await Promise.all([
    prisma.user.count(),
    prisma.startup.count(),
    prisma.vote.count(),
    prisma.comment.count(),
    countOpenReports(),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.startup.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logo: true,
        status: true,
        totalVotes: true,
        totalComments: true,
        createdAt: true,
        founder: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.user.count({ where: { role: 'developer' } }),
    prisma.user.count({ where: { role: 'investor' } }),
    prisma.investorInterest.count({ where: { status: 'PENDING' } }),
    prisma.startup.count({ where: { investorBacked: true } }),
    prisma.joinRequest.count(),
    prisma.startup.groupBy({ by: ['type'], _count: { id: true } }),
  ]);

  return {
    summary: {
      developers,
      investors,
      pendingMarks,
      backedProjects,
      joinRequests,
      totalUsers,
      totalProjects,
      totalLikes,
      totalComments,
      totalPosts,
      openReports,
    },
    recentProjects,
    projectsByType: byType.map((t) => ({ type: t.type, count: t._count.id })),
    permissions: {
      canUpdateProjects: true,
      canDeleteProjects: true,
      canManageUsers: true,
    },
  };
};

export const setUserVerified = (userId, verified) =>
  prisma.user.update({ where: { id: userId }, data: { verified }, select: { id: true, name: true, role: true, verified: true } });
