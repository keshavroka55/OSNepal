import express from "express";
import * as PostController from "./post.controller.js";
import { verifyToken, optionalAuth } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { postLimiter, voteLimiter } from "../../middleware/rateLimit.js";
import {
  feedQuery, postIdParam, createPostBody, editPostBody, voteBody, moderateBody,
} from "./post.schema.js";

const router = express.Router();

// Public reads (personalised when signed in)
router.get("/", optionalAuth, validate({ query: feedQuery }), PostController.GetFeed);
router.get("/:id", optionalAuth, validate({ params: postIdParam }), PostController.GetPost);

// Writes
router.post("/", verifyToken, postLimiter, validate({ body: createPostBody }), PostController.CreatePost);
router.patch("/:id", verifyToken, validate({ params: postIdParam, body: editPostBody }), PostController.EditPost);
router.delete("/:id", verifyToken, validate({ params: postIdParam }), PostController.DeletePost);
router.post("/:id/vote", verifyToken, voteLimiter, validate({ params: postIdParam, body: voteBody }), PostController.VotePost);
router.post("/:id/save", verifyToken, validate({ params: postIdParam }), PostController.SavePost);
router.post("/:id/moderate", verifyToken, validate({ params: postIdParam, body: moderateBody }), PostController.ModeratePost);

export default router;
