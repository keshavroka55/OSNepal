import express from "express";
import * as CommentController from "./comment.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public endpoints
router.get("/startup/:startupId", CommentController.GetComments);
router.get("/my", verifyToken, CommentController.GetMyComments);
router.get("/:id", CommentController.GetComment);

// Authenticated endpoints
router.post("/startup/:startupId", verifyToken, CommentController.CreateComment);
router.put("/:id", verifyToken, CommentController.UpdateComment);
router.delete("/:id", verifyToken, CommentController.DeleteComment);

export default router;
