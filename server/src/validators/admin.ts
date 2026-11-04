import { z } from 'zod';
import { COURSE_OPTIONS } from '../config/courses.js';

export const ENQUIRY_STATUSES = ['new', 'contacted', 'follow-up', 'admitted', 'rejected'] as const;

// Removes control characters and angle brackets from free text.
const cleanText = (value: string): string =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, ' ').trim();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a real date');

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Enter your email address' })
      .trim()
      .toLowerCase()
      .max(120, 'Use 120 characters or fewer')
      .email('Enter a valid email address'),
    // bcrypt only uses the first 72 bytes, so longer passwords are rejected rather than silently truncated.
    password: z
      .string({ required_error: 'Enter your password' })
      .min(1, 'Enter your password')
      .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'Password is too long'),
  })
  .strict();

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid enquiry identifier');

export const listFilterSchema = z
  .object({
    q: z.string().max(80, 'Search is limited to 80 characters').transform(cleanText).optional(),
    status: z.enum(ENQUIRY_STATUSES).optional(),
    course: z.enum(COURSE_OPTIONS).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .strict();

export const listQuerySchema = listFilterSchema.extend({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(5).max(50).default(10),
});

export const updateEnquirySchema = z
  .object({
    status: z.enum(ENQUIRY_STATUSES).optional(),
    internalNotes: z
      .string()
      .max(2000, 'Use 2000 characters or fewer')
      .transform(cleanText)
      .optional(),
  })
  .strict()
  .refine((v) => v.status !== undefined || v.internalNotes !== undefined, 'Nothing to update');
