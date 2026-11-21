import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { config } from "./config/config.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { originCheck } from "./middleware/originCheck.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import startupRoutes from "./modules/startups/startup.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import voteRoutes from "./modules/votes/vote.routes.js";
import bookmarkRoutes from "./modules/bookmarks/bookmark.routes.js";
import commentRoutes from "./modules/comments/comment.routes.js";
import followRoutes from "./modules/follows/follow.routes.js";
import leaderboardRoutes from "./modules/leaderboards/leaderboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import connectionRoutes from "./modules/connections/connection.routes.js";
import conversationRoutes from "./modules/conversations/conversation.routes.js";

// Open Source Nepal
import notificationRoutes from "./modules/notifications/notification.routes.js";
import badgeRoutes from "./modules/badges/badge.routes.js";
import joinRequestRoutes from "./modules/joinRequests/joinRequest.routes.js";
import contributionRoutes from "./modules/contributions/contribution.routes.js";
import investorRoutes from "./modules/investors/investor.routes.js";
import peopleRoutes from "./modules/people/people.routes.js";

// Ecosystem
import spaceRoutes from "./modules/spaces/space.routes.js";
import postRoutes from "./modules/posts/post.routes.js";
import postCommentRoutes from "./modules/postComments/postComment.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";

const app = express();

// Required behind Nginx so rate limiting and req.protocol see the real client.
app.set("trust proxy", 1);

// Uploaded images are loaded by the SPA from another origin, so allow
// cross-origin embedding of resources while keeping the other helmet defaults.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({ origin: config.allowedOrigins, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

const uploadsRoot = path.join(import.meta.dirname, "..", "public", "uploads");
["avatars", "logos", "banners", "screenshots", "posts"].forEach((dir) =>
  fs.mkdirSync(path.join(uploadsRoot, dir), { recursive: true }));
app.use("/uploads", express.static(uploadsRoot));

// Cheap, dependency-free liveness probe for the uptime monitor.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiLimiter);
app.use("/api", originCheck);

app.use("/api/auth", authRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/leaderboards", leaderboardRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/conversations", conversationRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/investors", investorRoutes);
app.use("/api/people", peopleRoutes);

app.use("/api/spaces", spaceRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post-comments", postCommentRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

export default app;
