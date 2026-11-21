import rateLimit from 'express-rate-limit';

const rateLimitHandler = (req, res, next, options) => {
  // Use the actual reset time from the rate limit info, not a static window
  const resetTime = req.rateLimit?.resetTime;
  const retryAfter = resetTime
    ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    : Math.ceil((options.windowMs ?? 15 * 60 * 1000) / 1000);

  res.status(options.statusCode ?? 429).json({
    success: false,
    message: options.message ?? 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter,
  });
};

// General API limiter — very permissive, only catches abnormal traffic
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 1000,                  // 1000 req / 15 min per IP (generous for real users)
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
  handler: rateLimitHandler,

  // Skip successful requests — only count failures/errors if you want to be even lighter
  // skip: (req, res) => res.statusCode < 400,
});

// Auth limiter — strict, brute-force focused
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 10,                    // Only 10 login attempts per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please wait before trying again.',
  handler: rateLimitHandler,

  // Only count failed auth attempts (status 400/401), not successful logins
  skip: (req, res) => res.statusCode < 400,
});

// Per-user limiters for community actions. They are separate so heavy voting
// can't lock someone out of commenting. Routes run verifyToken first, so the
// user id is always present.
const perUser = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message,
    handler: rateLimitHandler,
    keyGenerator: (req) => `user:${req.user.id}`,
  });

export const postLimiter = perUser({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: 'You are posting too fast. Please wait a few minutes.',
});

export const commentLimiter = perUser({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: 'You are commenting too fast. Please slow down.',
});

export const voteLimiter = perUser({
  windowMs: 60 * 1000,
  limit: 60,
  message: 'Too many votes in a short time.',
});

export const reportLimiter = perUser({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many reports. Please try again later.',
});
