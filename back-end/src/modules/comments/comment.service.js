import prisma from "../../prisma.js";
import { config } from "../../config/config.js";
import { notify } from "../notifications/notification.service.js";
import { evaluateBadges } from "../badges/badge.service.js";
import { getOrSetCache } from "../../middleware/cacheAside.js";
import { invalidateCommentCache } from "../../middleware/cacheAside.js";


export const getCommentsByStartup = async (startupId) => {
  // const cacheKey = `project:${startupId}:comments`;
  // return getOrSetCache(cacheKey, async () => {
  // the logic of caching
  const allComments = await prisma.comment.findMany({
    where: { startupId },
    include: {
      user: { select: { id: true, name: true, avatar: true, verified: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  const map = {};
  const roots = [];

  allComments.forEach(c => 
    (map[c.id] = { ...c, replies: [] }));
    
  allComments.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  });

  return roots;
  // }, config.COMMENT_TTL);
};

export const createComment = async (userId, startupId, content, parentId) => {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (!startup) throw new Error("Startup not found");

  const comment = await prisma.comment.create({
    data: {
      userId,
      startupId,
      content,
      parentId: parentId || null
    },
    include: {
      user: { select: { id: true, name: true, avatar: true, verified: true } }
    }
  });

  // Increment totalComments
  await prisma.startup.update({
    where: { id: startupId },
    data: { totalComments: { increment: 1 } }
  });

  // await invalidateCommentCache(startupId); 
  // the logic of caching. 

  await notify({
    userId: startup.founderId, actorId: userId, startupId,
    type: parentId ? "REPLY" : "COMMENT",
    message: parentId ? `replied in the discussion on ${startup.name}` : `commented on ${startup.name}`,
    link: `/projects/${startup.slug}`,
  });
  evaluateBadges(userId);

  return comment;
};

export const updateComment = async (id, userId, role, content) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new Error("Comment not found");

  if (role !== "admin" && comment.userId !== userId) {
    throw new Error("Not authorized");
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      user: { select: { id: true, name: true, avatar: true } }
    }
  });

  // await invalidateCommentCache(comment.startupId);
  return updated;
};

export const deleteComment = async (id, userId, role) => {
  const comment = await prisma.comment.findUnique({ where: { id }, include: { startup: true } });
  if (!comment) throw new Error("Comment not found");

  if (role !== "admin" && comment.userId !== userId) {
    throw new Error("Not authorized");
  }

  await prisma.comment.delete({ where: { id } });

  // Decrement totalComments
  if (comment.startupId) {
    await prisma.startup.update({
      where: { id: comment.startupId },
      data: { totalComments: { decrement: 1 } }
    });

    // await invalidateCommentCache(comment.startupId);
  }

  return { message: "Comment deleted successfully" };
};

export const getMyComments = async (userId) => {
  return prisma.comment.findMany({
    where: { userId },
    include: {
      startup: { select: { id: true, name: true, logo: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const getCommentById = async (id) => {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true, verified: true } },
      startup: { select: { id: true, name: true, slug: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, avatar: true, verified: true } }
        }
      }
    }
  });
};

