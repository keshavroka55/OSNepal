import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// For public endpoints that personalise the response when a user is signed in
// (e.g. "did I vote on this?"). A bad or missing token just means anonymous.
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      req.user = jwt.verify(token, config.JWT_SECRET);
    } catch {
      // ignore: treated as logged out
    }
  }
  next();
};
