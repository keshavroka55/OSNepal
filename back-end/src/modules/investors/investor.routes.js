import express from "express";
import { z } from "zod";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.js";
import * as S from "./investor.service.js";

const router = express.Router();
const id = z.string().uuid();

const dealQuery = z.object({
  type: z.enum(["STARTUP", "OPEN_SOURCE", "LEARNING", "IDEA", "HARDWARE"]).optional(),
  stage: z.enum(["IDEA", "BUILDING", "BETA", "LAUNCHED"]).optional(),
  category: z.string().max(80).optional(),
  backed: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  search: z.string().max(80).optional(),
  sort: z.enum(["traction", "new"]).default("traction"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Investor deal flow is open to investors and admins.
router.get("/deal-flow", verifyToken, allowRoles("investor", "admin"), validate({ query: dealQuery }), async (req, res, next) => {
  try { res.json(await S.dealFlow(req.validQuery)); } catch (e) { next(e); }
});

router.post("/interest", verifyToken, allowRoles("investor"), validate({ body: z.object({ startupId: id, note: z.string().trim().max(600).optional() }) }), async (req, res, next) => {
  try { res.status(201).json(await S.expressInterest(req.user.id, req.body)); } catch (e) { next(e); }
});
router.get("/interest/mine", verifyToken, allowRoles("investor"), async (req, res, next) => {
  try { res.json(await S.myInterests(req.user.id)); } catch (e) { next(e); }
});

// Admin review of Investor-mark requests.
router.get("/admin/queue", verifyToken, allowRoles("admin"), validate({ query: z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING") }) }), async (req, res, next) => {
  try { res.json(await S.queue(req.validQuery.status)); } catch (e) { next(e); }
});
router.patch("/admin/:id", verifyToken, allowRoles("admin"), validate({ params: z.object({ id }), body: z.object({ status: z.enum(["APPROVED", "REJECTED"]) }) }), async (req, res, next) => {
  try { res.json(await S.review(req.user.id, req.params.id, req.body.status)); } catch (e) { next(e); }
});
router.get("/admin/accounts", verifyToken, allowRoles("admin"), async (req, res, next) => {
  try { res.json(await S.investorAccounts()); } catch (e) { next(e); }
});
router.delete("/admin/mark/:startupId", verifyToken, allowRoles("admin"), validate({ params: z.object({ startupId: id }) }), async (req, res, next) => {
  try { res.json(await S.revokeMark(req.params.startupId)); } catch (e) { next(e); }
});

export default router;
