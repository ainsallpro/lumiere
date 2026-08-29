import rateLimit from 'express-rate-limit';

// Global API rate limiter: max 300 requests per 15 minutes per IP
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict rate limiter for Authentication (Login & Register): max 10 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.'
  }
});

// Checkout rate limiter: max 15 order submissions per 15 minutes
export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Order creation rate limit exceeded. Please wait a few moments before trying again.'
  }
});
