import express from "express";
import { config } from "../../config/config.js";
import { register, login, getMe, logout, registerAdmin, googleCallback, forgotPassword, resetPasswordController } from "./auth.controller.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import {
  registerSchema,
  loginSchema,
  adminRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validation/auth.schema.js";

import passport from "passport";

const router = express.Router();

// Stricter throttling for authentication endpoints
router.use(['/register', '/login', '/forgot-password', '/reset-password', '/google'], authLimiter);

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/me", verifyToken, getMe);


// Admin-only route
router.post("/register-admin", verifyToken, allowRoles("admin"), validate({ body: adminRegisterSchema }), registerAdmin);

// Google OAuth routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${config.allowedOrigins[0]}/login?error=google_auth_failed`,
        session: false
    }),
    googleCallback
);


router.post("/forgot-password", validate({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetPasswordController);

export default router;
