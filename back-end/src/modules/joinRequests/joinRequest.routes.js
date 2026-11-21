import express from "express";
import { z } from "zod";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import * as S from "./joinRequest.service.js";

const router = express.Router();
router.use(verifyToken);

const id = z.string().uuid();
const createBody = z.object({
  startupId: id,
  roleWanted: z.string().trim().min(2).max(60),
  message: z.string().trim().min(10, "Tell the team a little about yourself").max(1000),
});
const respondBody = z.object({ status: z.enum(["ACCEPTED", "REJECTED"]) });
const listQuery = z.object({ status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional() });

router.post("/", validate({ body: createBody }), async (req, res, next) => {
  try { res.status(201).json(await S.createJoinRequest(req.user.id, req.body)); } catch (e) { next(e); }
});
router.get("/sent", async (req, res, next) => {
  try { res.json(await S.listSent(req.user.id)); } catch (e) { next(e); }
});
router.get("/received", validate({ query: listQuery }), async (req, res, next) => {
  try { res.json(await S.listReceived(req.user.id, req.validQuery)); } catch (e) { next(e); }
});
router.patch("/:id/respond", validate({ params: z.object({ id }), body: respondBody }), async (req, res, next) => {
  try { res.json(await S.respond(req.user.id, req.params.id, req.body.status)); } catch (e) { next(e); }
});
router.delete("/:id", validate({ params: z.object({ id }) }), async (req, res, next) => {
  try { res.json(await S.withdraw(req.user.id, req.params.id)); } catch (e) { next(e); }
});

export default router;
