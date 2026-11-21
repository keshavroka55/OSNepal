import express from "express";
import { z } from "zod";
import prisma from "../../prisma.js";
import { AppError } from "../../utils/AppError.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { addReputationPoints } from "../users/user.service.js";
import { notify } from "../notifications/notification.service.js";
import { evaluateBadges } from "../badges/badge.service.js";

const router = express.Router();
const id = z.string().uuid();
const createBody = z.object({
  startupId: id,
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  url: z.string().url().max(500).optional().or(z.literal("")),
});
const include = { startup: { select: { id: true, name: true, slug: true, logo: true, type: true } }, user: { select: { id: true, name: true, username: true, avatar: true } } };

// Public: contributions a user has listed (used on profiles / interview showcase).
router.get("/user/:id", async (req, res, next) => {
  try {
    res.json(await prisma.contribution.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: "desc" }, include }));
  } catch (e) { next(e); }
});
router.get("/project/:id", async (req, res, next) => {
  try {
    res.json(await prisma.contribution.findMany({ where: { startupId: req.params.id }, orderBy: { createdAt: "desc" }, include }));
  } catch (e) { next(e); }
});

router.post("/", verifyToken, validate({ body: createBody }), async (req, res, next) => {
  try {
    const { startupId, title, description, url } = req.body;
    const startup = await prisma.startup.findUnique({ where: { id: startupId }, select: { founderId: true, name: true, slug: true } });
    if (!startup) throw new AppError("Project not found", 404);
    const isOwner = startup.founderId === req.user.id;
    const isMember = isOwner || !!(await prisma.projectMember.findUnique({ where: { startupId_userId: { startupId, userId: req.user.id } } }));
    if (!isMember) throw new AppError("Only team members can list contributions. Send a join request first.", 403);
    const created = await prisma.contribution.create({
      data: { userId: req.user.id, startupId, title, description: description || null, url: url || null, verified: isOwner },
      include,
    });
    if (!isOwner) await notify({ userId: startup.founderId, actorId: req.user.id, startupId, type: "JOIN_REQUEST", message: `listed a contribution on ${startup.name}: ${title}`, link: `/projects/${startup.slug}` });
    await evaluateBadges(req.user.id);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// The project owner vouches for a contribution.
router.patch("/:id/verify", verifyToken, validate({ params: z.object({ id }) }), async (req, res, next) => {
  try {
    const c = await prisma.contribution.findUnique({ where: { id: req.params.id }, include: { startup: { select: { founderId: true } } } });
    if (!c) throw new AppError("Not found", 404);
    if (c.startup.founderId !== req.user.id && req.user.role !== "admin") throw new AppError("Not authorized", 403);
    if (c.verified) return res.json(await prisma.contribution.findUnique({ where: { id: c.id }, include }));
    const updated = await prisma.contribution.update({ where: { id: c.id }, data: { verified: true }, include });
    await addReputationPoints(c.userId, 10);
    await evaluateBadges(c.userId);
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete("/:id", verifyToken, validate({ params: z.object({ id }) }), async (req, res, next) => {
  try {
    const c = await prisma.contribution.findUnique({ where: { id: req.params.id } });
    if (!c) throw new AppError("Not found", 404);
    if (c.userId !== req.user.id && req.user.role !== "admin") throw new AppError("Not authorized", 403);
    await prisma.contribution.delete({ where: { id: c.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
