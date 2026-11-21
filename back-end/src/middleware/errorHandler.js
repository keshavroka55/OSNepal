import { ZodError } from "zod";
import { config } from "../config/config.js";

// One place that decides what the client may see. Anything unexpected
// (database errors, stack traces) stays in server logs only.
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid request data",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    // Log the message and route, not the request body or headers (may hold tokens).
    console.error(`[error] ${req.method} ${req.path}:`, err.stack || err.message);
  }

  // Only deliberate 4xx messages are safe to show; 5xx are generic in production.
  const message =
    status < 500 || !config.isProduction ? err.message : "Something went wrong";

  res.status(status).json({ message });
};
