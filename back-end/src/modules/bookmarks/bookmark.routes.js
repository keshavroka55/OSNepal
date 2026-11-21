import express from "express";
import * as BookmarkController from "./bookmark.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Authenticated endpoints
router.post("/:startupId", verifyToken, BookmarkController.ToggleBookmark);
router.get("/my", verifyToken, BookmarkController.GetMyBookmarks);
router.get("/:startupId/check", verifyToken, BookmarkController.CheckIsBookmarked);

// Public endpoints
router.get("/:startupId/count", BookmarkController.GetBookmarkCount);

export default router;
