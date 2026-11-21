import express from "express";
import * as FollowController from "./follow.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:userId", verifyToken, FollowController.ToggleFollow);
router.get("/:userId/followers", verifyToken, FollowController.GetFollowers);
router.get("/:userId/following", verifyToken, FollowController.GetFollowing);
router.get("/:userId/check", verifyToken, FollowController.CheckIsFollowing);

export default router;
