import { z } from 'zod';
import { COURSE_OPTIONS, QUALIFICATIONS } from '../config/courses.js';

// Removes control characters and angle brackets; keeps line breaks in the free-text message.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g;
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const cleanText = (value: string): string =>
  value.replace(CONTROL_CHARS, ' ').replace(/[ \t]+/g, ' ').trim();

export const enquirySchema = z
  .object({
    studentName: z
      .string({ required_error: 'Enter the student’s name' })
      .transform(cleanText)
      .pipe(
        z
          .string()
          .min(2, 'Enter at least 2 characters')
          .max(80, 'Use 80 characters or fewer')
          .regex(NAME_RE, 'Use letters, spaces, dots, apostrophes or hyphens only'),
      ),
    mobile: z
      .string({ required_error: 'Enter a mobile number' })
      .transform((v) => v.replace(/[\s()-]/g, '').replace(/^\+91/, ''))
      .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')),
    email: z
      .string()
      .trim()
      .max(120, 'Use 120 characters or fewer')
      .refine((v) => v === '' || EMAIL_RE.test(v), 'Enter a valid email address, or leave this empty')
      .default(''),
    qualification: z.enum(QUALIFICATIONS, {
      errorMap: () => ({ message: 'Choose a qualification' }),
    }),
    course: z.enum(COURSE_OPTIONS, {
      errorMap: () => ({ message: 'Choose a course, or select Not sure yet' }),
    }),
    message: z
      .string()
      .max(500, 'Use 500 characters or fewer')
      .transform(cleanText)
      .default(''),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'Tick the consent box to submit your enquiry' }),
    }),
    // Honeypot: hidden from people, filled in by bots. Checked before validation in the route.
    website: z.string().max(200).optional(),
    sourcePage: z.string().max(200).default(''),
  })
  .strict();

export type EnquiryInput = z.infer<typeof enquirySchema>;
