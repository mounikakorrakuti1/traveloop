import rateLimit from 'express-rate-limit';

const rateLimitResponse = {
  error: 'Too many requests',
  code: 'RATE_LIMIT_EXCEEDED',
  details: null
};

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req): string => req.user?.id ?? req.ip ?? 'anonymous',
  message: rateLimitResponse
});
