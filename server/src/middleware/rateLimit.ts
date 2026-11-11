import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const WINDOW_MS = 15 * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});

export const enquiryLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: env.ENQUIRY_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many enquiries from this network. Please try again in 15 minutes, or message us on WhatsApp.',
    },
  },
});

export const testimonialLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many testimonial submissions or uploads. Please try again in 15 minutes.',
    },
  },
});
