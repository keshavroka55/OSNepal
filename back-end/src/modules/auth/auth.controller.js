import prisma from "../../prisma.js";
import { registerUser, loginUser } from "./authService.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import {
  requestPasswordReset,
  resetPassword
} from "./authService.js";


const isProduction = config.NODE_ENV === "production";


const tokenCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
};

export const register = async (req, res, next) => {
  try {

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const { name, email, password, role } = req.body;

    if (role === 'admin') {
      return res.status(403).json({ message: "Admin registration is not allowed" });
    }

    // Public sign-up is limited to developer and investor accounts.
    // Admins are created out-of-band with `npm run create-admin`.
    const allowedRole = role === "investor" ? "investor" : "developer";


    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await registerUser({ name, email, password, role: allowedRole });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    console.info(`Login attempt for: ${email}`);
    // Guard against upstream hangs (DB/Prisma) by timing out login attempt
    const TIMEOUT_MS = 8000;
    let user, token;
    try {
      ({ user, token } = await Promise.race([
        loginUser({ email, password }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('login_timeout')), TIMEOUT_MS)),
      ]));
    } catch (err) {
      console.error('Login processing error/timeout:', err && err.message ? err.message : err);
      if (err.message === 'login_timeout') {
        return res.status(504).json({ message: 'Login request timed out' });
      }
      return next(err);
    }

    res.cookie("token", token, {
      ...tokenCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });


    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return next(err);
  }
};


export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      avatar: true,
      headline: true,
      verified: true,
      profileCompleted: true,
    },
  });
  res.json(user);
};

export const logout = (req, res) => {
  // Use the same cookie attributes used while setting token
  // so browsers reliably remove it from storage.
  res.clearCookie("token", tokenCookieOptions);
  res.cookie("token", "", {
    ...tokenCookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });
  res.set("Cache-Control", "no-store");
  res.json({ message: "Logged out" });
};

// Protected route to register admin users (only accessible by existing admins)
export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }



    // Force admin role
    const user = await registerUser({
      name,
      email,
      password,
      role: "admin"
    });

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    return next(err);
  }
};

// controller for Contineu with google login.
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // Generate JWT token (same as regular login)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRATION }
    );



    // Set cookie (same as regular login)
    res.cookie("token", token, {
      ...tokenCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Smart redirect logic based on whether user is new or existing
    const redirectTarget = user.role === 'admin' ? 'dashboard' : 'home';
    // Redirect through login page so frontend can sync auth state and navigate reliably.
    const redirectUrl = `${config.CLIENT_URL}/login?google=success&redirect=${redirectTarget}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${config.CLIENT_URL}/login?error=auth_failed`);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Send email async without waiting (non-blocking)
    requestPasswordReset(email).catch((err) => {
      console.error("Email send failed:", err);
    });

    // Return success immediately
    res.json({ message: "If email exists, reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const result = await resetPassword(token, password);
    res.json(result);
  } catch (error) {
    console.error("Reset password error:", error);
    return next(error);
  }
};