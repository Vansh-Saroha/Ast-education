import { z } from 'zod';

// Keep in sync with server/src/config/courses.ts. The server is the final check.
export const COURSE_OPTIONS = [
  'LKG to Class 12', 'Academic Coaching', 'Subject-wise Academic Support',
  'B.A. Coaching', 'B.Com Coaching', 'B.Tech Coaching',
  'Basic Computer', 'DCA', 'ADCA', 'CCC', 'Tally', 'MS Office', 'Advanced Excel',
  'Coding Classes', 'Programming Education', 'Technical Skill Development',
  'English Speaking', 'Communication Skills', 'Motivation Classes', 'Personality Development',
  'Not sure yet',
];

export const QUALIFICATIONS = ['Class 10', 'Class 12', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'];

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^(\+91)?[6-9]\d{9}$/;

export const enquirySchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters')
    .max(80, 'Use 80 characters or fewer')
    .regex(NAME_RE, 'Use letters, spaces, dots, apostrophes or hyphens only'),
  mobile: z
    .string()
    .trim()
    .refine((v) => MOBILE_RE.test(v.replace(/[\s()-]/g, '')), 'Enter a valid 10-digit Indian mobile number'),
  email: z
    .string()
    .trim()
    .max(120, 'Use 120 characters or fewer')
    .refine((v) => v === '' || EMAIL_RE.test(v), 'Enter a valid email address, or leave this empty'),
  qualification: z.string().min(1, 'Choose a qualification'),
  course: z.string().min(1, 'Choose a course, or select Not sure yet'),
  message: z.string().max(500, 'Use 500 characters or fewer'),
  consent: z.boolean().refine((v) => v === true, 'Tick the consent box to continue'),
  website: z.string().max(200),
});

export type EnquiryForm = z.infer<typeof enquirySchema>;

/** Builds the pre-filled WhatsApp message link the student can review before sending. */
export function buildWhatsAppUrl(d: Pick<EnquiryForm, 'studentName' | 'mobile' | 'email' | 'qualification' | 'course' | 'message'>, whatsappNumber: string): string {
  const text = [
    'Hello AST Education, I would like to enquire about admission.',
    '',
    `Student Name: ${d.studentName}`,
    `Mobile Number: ${d.mobile}`,
    `Email: ${d.email || 'Not provided'}`,
    `Qualification: ${d.qualification}`,
    `Interested Course: ${d.course}`,
    `Message: ${d.message || 'None'}`,
  ].join('\n');
  const digits = whatsappNumber.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : '';
}
