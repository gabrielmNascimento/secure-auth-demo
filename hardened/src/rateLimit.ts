import rateLimit from 'express-rate-limit';

// Global limiter — every endpoint, every IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Stricter limiter on auth endpoints — defeats brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
  message: { error: 'Too many login attempts, please try again later' },
});
