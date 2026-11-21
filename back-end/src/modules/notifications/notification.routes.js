import express from "express";
import { verifyToken } from "../../middleware/authMiddleware.js";
import * as S from "./notification.service.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", async (req, res, next) => {
  try {
    const [items, unread] = await Promise.all([S.listNotifications(req.user.id), S.unreadCount(req.user.id)]);
    res.json({ items, unread });
  } catch (e) { next(e); }
});
router.get("/unread-count", async (req, res, next) => {
  try { res.json({ unread: await S.unreadCount(req.user.id) }); } catch (e) { next(e); }
});
router.post("/read-all", async (req, res, next) => {
  try { await S.markAllRead(req.user.id); res.json({ ok: true }); } catch (e) { next(e); }
});
router.patch("/:id/read", async (req, res, next) => {
  try { await S.markRead(req.user.id, req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

export default router;
