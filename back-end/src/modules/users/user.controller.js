import prisma from "../../prisma.js";
import * as UserService from "./user.service.js";
import { listDiscoverableUsers } from "./user.service.js";


// Get my profile
export const GetMyProfile = async (req, res) => {
  try {
    const user = await UserService.getMyProfile(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile by id
export const GetUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile by username
export const GetUserByUsername = async (req, res) => {
  try {
    const user = await UserService.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update my profile
export const UpdateMyProfile = async (req, res) => {
  try {
    const user = await UserService.updateMyProfile(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all users (admin only)
export const GetAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await UserService.getAllUsers(parseInt(page), parseInt(limit));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get top founders
export const GetTopFounders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const founders = await UserService.getTopFounders(parseInt(limit));
    res.json(founders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (admin only)
export const DeleteUser = async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update user role (admin only)
export const UpdateUserRole = async (req, res) => {
  try {
    const user = await UserService.updateUserRole(req.params.id, req.body.role);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// back-end/src/controllers/user.controller.js
export async function updateMessagePolicy(req, res) {
  const { messagePolicy } = req.body; // 'ANYONE' | 'CONNECTIONS_ONLY'

  if (!['ANYONE', 'CONNECTIONS_ONLY'].includes(messagePolicy)) {
    return res.status(400).json({ error: 'Invalid message policy' });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id }, // from your auth middleware, req.user set via JWT cookie
    data: { messagePolicy },
    select: { id: true, messagePolicy: true },
  });

  res.json(updated);
}


export async function discoverUsers(req, res) {
  const currentUserId = req.user?.id || null;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50); // cap to prevent abuse
  const search = (req.query.search || '').trim();

  try {
    const result = await listDiscoverableUsers(currentUserId, { page, limit, search });
    res.json(result);
  } catch (err) {
    console.error('discoverUsers error', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
}

// First-run setup. Picking developer vs investor is only possible once, before
// the profile is marked complete, and never for admins.
export async function CompleteOnboarding(req, res, next) {
  try {
    const me = await prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true, profileCompleted: true } });
    if (!me) return res.status(404).json({ message: "User not found" });

    const body = req.body || {};
    const data = { ...body, profileCompleted: true };
    delete data.role;
    const updated = await UserService.updateMyProfile(req.user.id, data);

    if (me.role !== "admin" && !me.profileCompleted && ["developer", "investor"].includes(body.role) && body.role !== me.role) {
      await prisma.user.update({ where: { id: req.user.id }, data: { role: body.role } });
      updated.role = body.role;
      // Role is carried in the JWT, so issue a fresh cookie.
      const { default: jwt } = await import("jsonwebtoken");
      const { config } = await import("../../config/config.js");
      const isProduction = config.NODE_ENV === "production";
      const token = jwt.sign({ id: req.user.id, role: body.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });
      res.cookie("token", token, { httpOnly: true, sameSite: isProduction ? "none" : "lax", secure: isProduction, path: "/", maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
    const { evaluateBadges } = await import("../badges/badge.service.js");
    await evaluateBadges(req.user.id);
    res.json(updated);
  } catch (e) { next(e); }
}
