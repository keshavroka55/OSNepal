import express from "express";
import * as UserController from "./user.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { updateMessagePolicy } from "./user.controller.js";

const router = express.Router();

// Public endpoints
router.get("/founders/top", UserController.GetTopFounders);
router.get("/username/:username", UserController.GetUserByUsername);

// Authenticated endpoints
router.get("/me", verifyToken, UserController.GetMyProfile);
router.put("/me", verifyToken, UserController.UpdateMyProfile);
router.get("/discover", UserController.discoverUsers);
router.put("/me/onboarding", verifyToken, UserController.CompleteOnboarding);
router.get("/:id", UserController.GetUserById);

// Admin endpoints
router.get("/", verifyToken, allowRoles("admin"), UserController.GetAllUsers);
router.delete("/:id", verifyToken, allowRoles("admin"), UserController.DeleteUser);
router.put("/:id/role", verifyToken, allowRoles("admin"), UserController.UpdateUserRole);

// for message connect or direct message features 
router.patch('/me/message-policy', verifyToken, updateMessagePolicy);

export default router;