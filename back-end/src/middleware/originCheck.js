import { config } from "../config/config.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF defence for cookie auth. Production cookies use SameSite=None (the
// client and API live on different origins), so the browser alone won't stop
// cross-site form posts. Browsers always send Origin on cross-site mutating
// requests, so we reject any whose Origin is not on our allow-list.
// This avoids adding a token library while covering the real attack.
export const originCheck = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  // Non-browser clients (curl, server-to-server, tests) send no Origin and
  // cannot ride a victim's cookies, so they are allowed through.
  if (!origin) return next();

  if (config.allowedOrigins.includes(origin)) return next();
  return res.status(403).json({ message: "Origin not allowed" });
};
