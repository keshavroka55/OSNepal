import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { addReputationPoints } from "../users/user.service.js";
import { notify } from "../notifications/notification.service.js";
import { evaluateBadges } from "../badges/badge.service.js";
import { invalidateStartupCaches } from "../../middleware/cacheAside.js";

const userSel = { id: true, name: true, username: true, avatar: true, headline: true, skills: true, location: true, verified: true };
const startupSel = { id: true, name: true, slug: true, logo: true, type: true, founderId: true };

export async function createJoinRequest(userId, { startupId, roleWanted, message }) {
  const startup = await prisma.startup.findUnique({ where: { id: startupId }, select: { ...startupSel, status: true, name: true } });
  if (!startup || startup.status !== "published") throw new AppError("Project not found", 404);
  if (startup.founderId === userId) throw new AppError("You already own this project", 400);
  const member = await prisma.projectMember.findUnique({ where: { startupId_userId: { startupId, userId } } });
  if (member) throw new AppError("You are already on this team", 409);

  const existing = await prisma.joinRequest.findUnique({ where: { startupId_userId: { startupId, userId } } });
  if (existing?.status === "PENDING") throw new AppError("You already have a pending request", 409);

  const data = { roleWanted, message, status: "PENDING", respondedAt: null };
  const request = existing
    ? await prisma.joinRequest.update({ where: { id: existing.id }, data, include: { startup: { select: startupSel } } })
    : await prisma.joinRequest.create({ data: { ...data, startupId, userId }, include: { startup: { select: startupSel } } });

  await notify({
    userId: startup.founderId, actorId: userId, type: "JOIN_REQUEST", startupId,
    message: `wants to join ${startup.name} as ${roleWanted}`, link: "/join-requests",
  });
  return request;
}

export const listSent = (userId) =>
  prisma.joinRequest.findMany({
    where: { userId }, orderBy: { createdAt: "desc" },
    include: { startup: { select: { ...startupSel, tagline: true } } },
  });

export const listReceived = (ownerId, { status } = {}) =>
  prisma.joinRequest.findMany({
    where: { startup: { founderId: ownerId }, ...(status && { status }) },
    orderBy: { createdAt: "desc" },
    include: { user: { select: userSel }, startup: { select: startupSel } },
  });

export async function respond(ownerId, requestId, status) {
  const req = await prisma.joinRequest.findUnique({ where: { id: requestId }, include: { startup: { select: startupSel } } });
  if (!req) throw new AppError("Request not found", 404);
  if (req.startup.founderId !== ownerId) throw new AppError("Not authorized", 403);
  if (req.status !== "PENDING") throw new AppError("This request was already handled", 409);

  await prisma.$transaction(async (tx) => {
    await tx.joinRequest.update({ where: { id: requestId }, data: { status, respondedAt: new Date() } });
    if (status === "ACCEPTED") {
      await tx.projectMember.upsert({
        where: { startupId_userId: { startupId: req.startupId, userId: req.userId } },
        update: { role: req.roleWanted },
        create: { startupId: req.startupId, userId: req.userId, role: req.roleWanted },
      });
      // Accepting a request also opens the door to messaging.
      const link = await tx.connection.findFirst({
        where: { OR: [{ requesterId: ownerId, receiverId: req.userId }, { requesterId: req.userId, receiverId: ownerId }] },
      });
      if (!link) await tx.connection.create({ data: { requesterId: req.userId, receiverId: ownerId, status: "ACCEPTED" } });
      else if (link.status !== "ACCEPTED") await tx.connection.update({ where: { id: link.id }, data: { status: "ACCEPTED" } });
    }
  });

  await notify({
    userId: req.userId, actorId: ownerId, startupId: req.startupId,
    type: status === "ACCEPTED" ? "JOIN_ACCEPTED" : "JOIN_REJECTED",
    message: status === "ACCEPTED" ? `accepted you onto ${req.startup.name}` : `declined your request to join ${req.startup.name}`,
    link: status === "ACCEPTED" ? `/projects/${req.startup.slug}` : "/join-requests",
  });
  await invalidateStartupCaches({ id: req.startupId, slug: req.startup.slug });
  if (status === "ACCEPTED") {
    await Promise.all([addReputationPoints(req.userId, 5), addReputationPoints(ownerId, 5)]);
    await Promise.all([evaluateBadges(req.userId), evaluateBadges(ownerId)]);
  }
  return { id: requestId, status };
}

export async function withdraw(userId, requestId) {
  const req = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!req || req.userId !== userId) throw new AppError("Request not found", 404);
  if (req.status !== "PENDING") throw new AppError("Only pending requests can be withdrawn", 409);
  await prisma.joinRequest.update({ where: { id: requestId }, data: { status: "WITHDRAWN", respondedAt: new Date() } });
  return { id: requestId, status: "WITHDRAWN" };
}
