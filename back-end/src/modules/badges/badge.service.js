import prisma from "../../prisma.js";
import { BADGES, BADGE_BY_KEY } from "./badge.definitions.js";
import { notify } from "../notifications/notification.service.js";

const FOUNDING_CUTOFF = new Date("2027-06-30T23:59:59Z");

// Idempotent: creates any missing badge rows so a fresh DB works without seeding.
export async function syncBadgeCatalog() {
  for (const { key, name, description, icon, tier } of BADGES) {
    await prisma.badge.upsert({ where: { key }, update: { name, description, icon, tier }, create: { key, name, description, icon, tier } });
  }
}

async function collectStats(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, verified: true, createdAt: true } });
  if (!user) return null;
  const [projects, memberships, contributions, verifiedContributions, comments, connections, backedProjects, approvedInterests, likes] = await Promise.all([
    prisma.startup.count({ where: { founderId: userId, status: "published" } }),
    prisma.projectMember.count({ where: { userId } }),
    prisma.contribution.count({ where: { userId } }),
    prisma.contribution.count({ where: { userId, verified: true } }),
    Promise.all([prisma.comment.count({ where: { userId } }), prisma.postComment.count({ where: { authorId: userId, deletedAt: null } })]).then(([a, b]) => a + b),
    prisma.connection.count({ where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { receiverId: userId }] } }),
    prisma.startup.count({ where: { founderId: userId, investorBacked: true } }),
    prisma.investorInterest.count({ where: { investorId: userId, status: "APPROVED" } }),
    prisma.startup.aggregate({ where: { founderId: userId }, _sum: { totalVotes: true } }),
  ]);
  return {
    projects, memberships, contributions, verifiedContributions, comments, connections, backedProjects, approvedInterests,
    likesReceived: likes._sum.totalVotes ?? 0,
    isInvestor: user.role === "investor",
    verified: user.verified,
    joinedBeforeLaunchCutoff: user.createdAt <= FOUNDING_CUTOFF,
  };
}

// Awards every badge the user now qualifies for. Safe to call after any action.
export async function evaluateBadges(userId) {
  try {
    const stats = await collectStats(userId);
    if (!stats) return [];
    const owned = new Set((await prisma.userBadge.findMany({ where: { userId }, select: { badge: { select: { key: true } } } })).map((r) => r.badge.key));
    const earned = BADGES.filter((b) => !owned.has(b.key) && b.check(stats));
    if (earned.length === 0) return [];
    await syncBadgeCatalog();
    const rows = await prisma.badge.findMany({ where: { key: { in: earned.map((b) => b.key) } } });
    await prisma.userBadge.createMany({ data: rows.map((b) => ({ userId, badgeId: b.id })), skipDuplicates: true });
    await Promise.all(earned.map((b) => notify({ userId, type: "BADGE", message: `You earned the "${b.name}" badge`, link: "/profile" })));
    return earned.map((b) => b.key);
  } catch (err) {
    console.warn("evaluateBadges failed:", err.message);
    return [];
  }
}

export const getUserBadges = (userId) =>
  prisma.userBadge.findMany({ where: { userId }, include: { badge: true }, orderBy: { awardedAt: "desc" } }).then((rows) => rows.map((r) => ({ ...r.badge, awardedAt: r.awardedAt })));

export const getCatalog = () => BADGES.map(({ check, ...b }) => b);
export { BADGE_BY_KEY };
