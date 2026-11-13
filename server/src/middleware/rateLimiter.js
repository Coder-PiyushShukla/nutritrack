import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/errors.js';
import { isTest } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 15, // Stricter for auth in production, relaxed in tests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many authentication attempts, please try again in 15 minutes'));
  },
  skip: () => isTest,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests from this IP, please try again later'));
  },
  skip: () => isTest,
});
