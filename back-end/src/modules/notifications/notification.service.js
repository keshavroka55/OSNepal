import prisma from "../../prisma.js";
import { emitToRoom, userRoom } from "../../lib/realtime.js";

const actorSelect = { id: true, name: true, username: true, avatar: true };

// Create a notification and push it live to the recipient if they are online.
// Never throws: a failed notification must not fail the action that caused it.
export async function notify({ userId, actorId = null, type, startupId = null, message = null, link = null }) {
  if (!userId || userId === actorId) return null;
  try {
    const n = await prisma.notification.create({
      data: { userId, actorId, type, startupId, message, link },
      include: { actor: { select: actorSelect }, startup: { select: { id: true, name: true, slug: true } } },
    });
    emitToRoom(userRoom(userId), "notification", n);
    return n;
  } catch (err) {
    console.warn("notify failed:", err.message);
    return null;
  }
}

export const listNotifications = (userId, { limit = 40 } = {}) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { actor: { select: actorSelect }, startup: { select: { id: true, name: true, slug: true } } },
  });

export const unreadCount = (userId) => prisma.notification.count({ where: { userId, read: false } });

export const markRead = (userId, id) =>
  prisma.notification.updateMany({ where: { id, userId }, data: { read: true } });

export const markAllRead = (userId) =>
  prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
