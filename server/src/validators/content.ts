import { z } from 'zod';
import { CONTENT_STATUSES, COURSE_CATEGORIES, GALLERY_CATEGORIES, PHOTO_PERMISSIONS, VERIFICATION_STATUSES } from '../models/Content.js';

const clean = (v: string): string =>
  v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, ' ').replace(/[ \t]+/g, ' ').trim();

const text = (max: number) => z.string().max(max, `Use ${max} characters or fewer`).transform(clean);
const requiredText = (max: number, min = 1) =>
  text(max).refine((v) => v.length >= min, `Enter at least ${min} character${min > 1 ? 's' : ''}`);

// Images are referenced by their media-store identifier only. Browsers never supply storage paths.
const mediaId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose an uploaded image');

const review = {
  status: z.enum(CONTENT_STATUSES).optional(),
  verification: z.enum(VERIFICATION_STATUSES).optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
};

const courseFields = {
  name: requiredText(80, 2),
  category: z.enum(COURSE_CATEGORIES),
  description: text(1000).optional(),
};

const leadershipFields = {
  profileType: z.enum(['director', 'manager']),
  designation: requiredText(80, 2),
  name: text(80).optional(),
  qualifications: text(2000).optional(),
  experience: text(2000).optional(),
  biography: text(4000).optional(),
  responsibilities: text(2000).optional(),
  skills: text(2000).optional(),
  teachingManagement: text(2000).optional(),
  achievements: text(2000).optional(),
  visionMission: text(2000).optional(),
  studentMessage: text(2000).optional(),
  quote: text(1000).optional(),
  portraitAssetId: mediaId.nullable().optional(),
  photoPermission: z.enum(PHOTO_PERMISSIONS).optional(),
};

const galleryFields = {
  category: z.enum(GALLERY_CATEGORIES),
  caption: text(160).optional(),
  altText: requiredText(200),
  imageAssetId: mediaId,
  permissionConfirmed: z.boolean().optional(),
};

const testimonialFields = {
  studentName: requiredText(80, 2),
  courseName: text(80).optional(),
  feedback: requiredText(1000, 10),
  rating: z.number().int().min(1).max(5).optional(),
  consentStatus: z.enum(['pending', 'confirmed']).optional(),
};

const make = <T extends z.ZodRawShape>(fields: T) => ({
  create: z.object({ ...fields, ...review }).strict(),
  update: z.object({ ...fields, ...review }).partial().strict(),
});

export const contentSchemas = {
  courses: make(courseFields),
  leadership: make(leadershipFields),
  gallery: make(galleryFields),
  testimonials: make(testimonialFields),
};

export const updateFactSchema = z
  .object({
    label: requiredText(80, 2).optional(),
    value: text(300).optional(),
    note: text(500).optional(),
    publicVisibility: z.boolean().optional(),
    proofAssetId: mediaId.nullable().optional(),
    verification: z.enum(VERIFICATION_STATUSES).optional(),
    verificationSource: z.enum(['owner-confirmed', 'document-checked']).optional(),
  })
  .strict();

export const createFactSchema = z
  .object({
    key: z.string().regex(/^[a-z][a-zA-Z0-9]{1,39}$/, 'Use a fact key starting with a lowercase letter, with letters or numbers only'),
    label: requiredText(80, 2),
    value: requiredText(300, 1),
    note: text(500).optional(),
    publicVisibility: z.boolean().default(true),
    verificationType: z.enum(['owner-confirmed', 'independently-verified']).optional(),
    proofAssetId: mediaId.nullable().optional(),
  })
  .strict();

export const factKeySchema = z.string().regex(/^[a-z][a-zA-Z0-9]{1,39}$/, 'Invalid fact key');
