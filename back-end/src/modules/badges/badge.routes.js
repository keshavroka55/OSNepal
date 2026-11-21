import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { getCatalog, getUserBadges, evaluateBadges } from "./badge.service.js";

const router = express.Router();
router.get("/", (req, res) => res.json(getCatalog()));
router.get("/me", verifyToken, async (req, res, next) => {
  try { await evaluateBadges(req.user.id); res.json(await getUserBadges(req.user.id)); } catch (e) { next(e); }
});
router.get("/user/:id", async (req, res, next) => {
  try { res.json(await getUserBadges(req.params.id)); } catch (e) { next(e); }
});
export default router;
