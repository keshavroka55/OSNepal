import express from "express";
import * as SpaceController from "./space.controller.js";
import { verifyToken, optionalAuth } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { postLimiter } from "../../middleware/rateLimit.js";
import { createSpaceBody, slugParam } from "./space.schema.js";

const router = express.Router();

// Public: anyone can browse; signed-in users also get their role.
router.get("/", optionalAuth, SpaceController.ListSpaces);
router.get("/:slug", optionalAuth, validate({ params: slugParam }), SpaceController.GetSpace);

router.post("/", verifyToken, postLimiter, validate({ body: createSpaceBody }), SpaceController.CreateSpace);
router.post("/:slug/join", verifyToken, validate({ params: slugParam }), SpaceController.JoinSpace);
router.delete("/:slug/join", verifyToken, validate({ params: slugParam }), SpaceController.LeaveSpace);

export default router;
