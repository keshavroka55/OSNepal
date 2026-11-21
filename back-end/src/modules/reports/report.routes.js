import express from "express";
import * as ReportController from "./report.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.js";
import { reportLimiter } from "../../middleware/rateLimit.js";
import { createBody, reportIdParam, queueQuery, resolveBody } from "./report.schema.js";

const router = express.Router();

router.post("/", verifyToken, reportLimiter, validate({ body: createBody }), ReportController.CreateReport);

// Admin moderation queue
router.get("/", verifyToken, allowRoles("admin"), validate({ query: queueQuery }), ReportController.ListQueue);
router.patch("/:id", verifyToken, allowRoles("admin"), validate({ params: reportIdParam, body: resolveBody }), ReportController.ResolveReport);

export default router;
