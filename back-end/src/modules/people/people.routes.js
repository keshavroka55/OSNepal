import express from "express";
import { z } from "zod";
import prisma from "../../prisma.js";
import { verifyToken, optionalAuth } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";

const router = express.Router();

const listQuery = z.object({
  q: z.string().trim().max(80).optional(),
  skill: z.string().trim().max(40).optional(),
  role: z.enum(["developer", "investor"]).optional(),
  location: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(18),
});

const card = {
  id: true, name: true, username: true, avatar: true, headline: true, bio: true, location: true,
  skills: true, role: true, verified: true, reputationPoints: true, firm: true, focusAreas: true,
  _count: { select: { startups: true, memberships: true, contributions: true, badges: true } },
};

// People directory: find collaborators by skill, role and place.
router.get("/", optionalAuth, validate({ query: listQuery }), async (req, res, next) => {
  try {
    const { q, skill, role, location, page, limit } = req.validQuery;
    const where = {
      role: { in: role ? [role] : ["developer", "investor"] },
      ...(req.user && { id: { not: req.user.id } }),
      ...(skill && { skills: { has: skill } }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      ...(q && { OR: [
        { name: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { headline: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ] }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: card, orderBy: [{ reputationPoints: "desc" }, { createdAt: "desc" }], skip: (page - 1) * limit, take: limit }),
      prisma.user.count({ where }),
    ]);

    let status = new Map();
    if (req.user) {
      const conns = await prisma.connection.findMany({ where: { OR: [{ requesterId: req.user.id }, { receiverId: req.user.id }] } });
      for (const c of conns) status.set(c.requesterId === req.user.id ? c.receiverId : c.requesterId, c.status === "REJECTED" ? "NONE" : c.status);
    }
    res.json({
      items: users.map((u) => ({ ...u, connectionStatus: status.get(u.id) ?? "NONE" })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) { next(e); }
});

// Top builders for the people leaderboard.
router.get("/top", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);
    const users = await prisma.user.findMany({
      where: { role: { in: ["developer"] } },
      select: card, orderBy: [{ reputationPoints: "desc" }, { createdAt: "asc" }], take: limit,
    });
    res.json(users);
  } catch (e) { next(e); }
});

// Distinct skills in use, for filter chips.
router.get("/skills", async (req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`SELECT s AS skill, COUNT(*)::int AS count FROM users, UNNEST(skills) AS s GROUP BY s ORDER BY count DESC, s ASC LIMIT 40`;
    res.json(rows);
  } catch (e) { next(e); }
});

// Profile summary used by the app shell.
router.get("/me/summary", verifyToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const [projects, memberships, pendingRequests, unread] = await Promise.all([
      prisma.startup.count({ where: { founderId: id } }),
      prisma.projectMember.count({ where: { userId: id } }),
      prisma.joinRequest.count({ where: { startup: { founderId: id }, status: "PENDING" } }),
      prisma.notification.count({ where: { userId: id, read: false } }),
    ]);
    res.json({ projects, memberships, pendingRequests, unread });
  } catch (e) { next(e); }
});

export default router;
