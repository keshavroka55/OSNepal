import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { invalidateEcosystemFeeds } from "../../middleware/cacheAside.js";

async function findTarget(targetType, targetId) {
  if (targetType === "POST") {
    return prisma.post.findFirst({ where: { id: targetId, deletedAt: null }, select: { id: true, authorId: true } });
  }
  return prisma.postComment.findFirst({ where: { id: targetId, deletedAt: null }, select: { id: true, authorId: true } });
}

export async function createReport(userId, { targetType, targetId, reason }) {
  const target = await findTarget(targetType, targetId);
  if (!target) throw new AppError("Content not found", 404);
  if (target.authorId === userId) throw new AppError("You can't report your own content", 400);

  try {
    await prisma.report.create({ data: { reporterId: userId, targetType, targetId, reason } });
  } catch (err) {
    // The unique (reporter, target) index turns repeat reports into a clear message.
    if (err.code === "P2002") throw new AppError("You already reported this", 409);
    throw err;
  }
  return { reported: true };
}

// Admin queue. Targets are fetched in two batched queries, not one per report.
export async function listQueue({ status, cursor, limit }) {
  const reports = await prisma.report.findMany({
    where: { status },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
    take: limit + 1,
    include: { reporter: { select: { id: true, name: true, username: true } } },
  });
  const hasMore = reports.length > limit;
  const page = reports.slice(0, limit);

  const idsOf = (type) => page.filter((r) => r.targetType === type).map((r) => r.targetId);
  const [posts, comments] = await Promise.all([
    prisma.post.findMany({
      where: { id: { in: idsOf("POST") } },
      select: { id: true, title: true, status: true, space: { select: { slug: true } }, author: { select: { id: true, name: true } } },
    }),
    prisma.postComment.findMany({
      where: { id: { in: idsOf("COMMENT") } },
      select: { id: true, body: true, postId: true, deletedAt: true, author: { select: { id: true, name: true } } },
    }),
  ]);
  const byId = new Map([...posts, ...comments].map((t) => [t.id, t]));

  return {
    items: page.map((r) => ({ ...r, target: byId.get(r.targetId) ?? null })),
    nextCursor: hasMore ? page.at(-1).id : null,
  };
}

export async function resolveReport(adminId, id, { status, removeTarget }) {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new AppError("Report not found", 404);

  await prisma.$transaction(async (tx) => {
    if (removeTarget) {
      if (report.targetType === "POST") {
        await tx.post.update({ where: { id: report.targetId }, data: { status: "REMOVED" } });
      } else {
        await tx.postComment.update({ where: { id: report.targetId }, data: { deletedAt: new Date(), body: "" } });
      }
    }
    // Close every open report on the same content, so duplicates don't linger.
    await tx.report.updateMany({
      where: { targetType: report.targetType, targetId: report.targetId, status: "OPEN" },
      data: { status, resolvedById: adminId, resolvedAt: new Date() },
    });
  });

  if (removeTarget) await invalidateEcosystemFeeds();
  return { status };
}

export const countOpenReports = () => prisma.report.count({ where: { status: "OPEN" } });
