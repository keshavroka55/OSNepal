import express from "express";
import * as CommentController from "./postComment.controller.js";
import { verifyToken, optionalAuth } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validate.js";
import { commentLimiter, voteLimiter } from "../../middleware/rateLimit.js";
import {
  postIdParam, commentIdParam, listQuery, createBody, editBody, voteBody,
} from "./postComment.schema.js";

const router = express.Router();

// Public reads
router.get("/post/:postId", optionalAuth, validate({ params: postIdParam, query: listQuery }), CommentController.ListComments);
router.get("/:id/replies", optionalAuth, validate({ params: commentIdParam, query: listQuery }), CommentController.ListReplies);

// Writes
router.post("/post/:postId", verifyToken, commentLimiter, validate({ params: postIdParam, body: createBody }), CommentController.CreateComment);
router.patch("/:id", verifyToken, validate({ params: commentIdParam, body: editBody }), CommentController.EditComment);
router.delete("/:id", verifyToken, validate({ params: commentIdParam }), CommentController.DeleteComment);
router.post("/:id/vote", verifyToken, voteLimiter, validate({ params: commentIdParam, body: voteBody }), CommentController.VoteComment);

export default router;
