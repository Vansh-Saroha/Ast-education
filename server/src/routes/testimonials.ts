import express, { Router, type Request, type Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Testimonial } from '../models/Content.js';
import { MediaAsset } from '../models/Media.js';
import { ACCEPTED_TYPES, sanitizeDisplayName } from '../media/format.js';
import { assetView, createAsset, deleteAssetIfUnused } from '../media/service.js';
import { MediaError } from '../media/pipeline.js';
import { testimonialLimiter } from '../middleware/rateLimit.js';
import { env } from '../config/env.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { objectIdSchema } from '../validators/admin.js';
import { recordAuditEvent } from '../audit/record.js';
import { responsiveImage } from '../media/delivery.js';

const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, ' ').replace(/[ \t]+/g, ' ').trim();
const submissionSchema = z.object({
  studentName: z.string().transform(clean).pipe(z.string().min(2, 'Enter your full name.').max(80, 'Use 80 characters or fewer.')),
  courseName: z.string().transform(clean).pipe(z.string().min(2, 'Enter your course name.').max(80, 'Use 80 characters or fewer.')),
  rating: z.number().int().min(1).max(5),
  review: z.string().transform(clean).pipe(z.string().min(10, 'Write at least 10 characters.').max(1000, 'Use 1000 characters or fewer.')),
  photoAssetId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required before publishing.' }) }),
  website: z.string().optional(),
}).strict();

const updateSchema = z.object({
  studentName: z.string().transform(clean).pipe(z.string().min(2).max(80)).optional(),
  courseName: z.string().transform(clean).pipe(z.string().min(2).max(80)).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().transform(clean).pipe(z.string().min(10).max(1000)).optional(),
  photoAssetId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  consent: z.boolean().optional(),
}).strict();

export const testimonialPublicRouter = Router();
const testimonialUploadLimiter = testimonialLimiter;

testimonialPublicRouter.post('/testimonials/upload', testimonialUploadLimiter, express.raw({ type: [...ACCEPTED_TYPES], limit: `${env.MEDIA_MAX_UPLOAD_MB}mb` }), async (req: Request, res: Response) => {
  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    res.status(400).json({ error: { code: 'EMPTY_FILE', message: 'Choose a JPEG, PNG or WebP image.' } });
    return;
  }
  try {
    const asset = await createAsset(req.body, 'testimonial', sanitizeDisplayName(req.get('X-Filename')));
    res.status(201).json({ asset: assetView(asset) });
  } catch (err) {
    if (err instanceof MediaError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message } });
      return;
    }
    throw err;
  }
});

testimonialPublicRouter.post('/testimonials', testimonialLimiter, async (req, res) => {
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    res.status(201).json({ received: true, message: 'Thank you! Your testimonial has been submitted and is waiting for admin approval.' });
    return;
  }
  const input = submissionSchema.parse(req.body ?? {});

  if (input.photoAssetId) {
    const asset = await MediaAsset.findById(input.photoAssetId).select('purpose').lean();
    if (!asset || asset.purpose !== 'testimonial') {
      res.status(422).json({ error: { code: 'INVALID_IMAGE', message: 'The selected student photo is not valid.' } });
      return;
    }
  }

  const duplicate = await Testimonial.exists({
    studentName: input.studentName,
    courseName: input.courseName,
    review: input.review,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (!duplicate) {
    await Testimonial.create({
      studentName: input.studentName,
      courseName: input.courseName,
      rating: input.rating,
      review: input.review,
      feedback: input.review,
      photoAssetId: input.photoAssetId ?? null,
      photo: '',
      status: 'pending',
      consent: true,
      consentStatus: 'confirmed',
    });
  }
  res.status(201).json({ received: true, message: 'Thank you! Your testimonial has been submitted and is waiting for admin approval.' });
});

testimonialPublicRouter.get('/testimonials', async (_req, res) => {
  const rows = await Testimonial.find({ status: 'approved', consent: true })
    .sort({ createdAt: -1 })
    .select('studentName courseName review feedback rating photoAssetId createdAt')
    .populate({ path: 'photoAssetId', select: 'width height variants' })
    .lean();
  res.json({ items: rows.map((row) => {
    const asset = row.photoAssetId as unknown as {
      _id: unknown;
      width: number;
      height: number;
      variants: Array<{ width: number }>;
    } | null;
    const image = asset ? responsiveImage(String(asset._id), asset.variants, asset.width, asset.height) : null;
    return {
      id: String(row._id),
      studentName: row.studentName,
      courseName: row.courseName,
      review: row.review || row.feedback,
      rating: row.rating,
      photo: image && asset ? { id: String(asset._id), ...image } : null,
    };
  }) });
});

export const testimonialAdminRouter = Router();

testimonialAdminRouter.get('/testimonials/stats', requireAdmin, requireRole('owner'), async (_req, res) => {
  const grouped = await Testimonial.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = { pending: 0, approved: 0, rejected: 0 };
  let total = 0;
  for (const row of grouped) {
    const status = row._id === 'approved' || row._id === 'published' ? 'approved'
      : row._id === 'rejected' || row._id === 'archived' ? 'rejected'
      : 'pending';
    counts[status] += row.count;
    total += row.count;
  }
  res.json({ total, counts });
});

testimonialAdminRouter.get('/testimonials', requireAdmin, requireRole('owner'), async (req, res) => {
  const filter = req.query.status && ['pending', 'approved', 'rejected'].includes(String(req.query.status))
    ? { status: String(req.query.status) }
    : {};
  const rows = await Testimonial.find(filter).sort({ createdAt: -1 }).populate({ path: 'photoAssetId', select: 'width height variants' }).lean();
  res.json({ items: rows.map((row) => ({
    id: String(row._id),
    studentName: row.studentName,
    courseName: row.courseName,
    rating: row.rating,
    review: row.review || row.feedback,
    photoAssetId: row.photoAssetId ? String((row.photoAssetId as unknown as { _id: unknown })._id) : null,
    status: String(row.status) === 'approved' || String(row.status) === 'published' ? 'approved'
      : String(row.status) === 'rejected' || String(row.status) === 'archived' ? 'rejected'
      : 'pending',
    consent: row.consent ?? row.consentStatus === 'confirmed',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })) });
});

testimonialAdminRouter.patch('/testimonials/:id/approve', requireAdmin, requireRole('owner'), async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const current = await Testimonial.findById(id).lean();
  if (!current) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
  if (!current.consent && current.consentStatus !== 'confirmed') {
    return void res.status(422).json({ error: { code: 'CONSENT_REQUIRED', message: 'A testimonial cannot be approved without student consent.' } });
  }
  const row = await Testimonial.findByIdAndUpdate(id, { $set: { status: 'approved', consent: true, consentStatus: 'confirmed' } }, { new: true, runValidators: true }).lean();
  if (!row) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
  recordAuditEvent('testimonial_approve', req.admin!.id, { testimonialId: id });
  res.json({ item: { id, status: 'approved' } });
});

testimonialAdminRouter.patch('/testimonials/:id/reject', requireAdmin, requireRole('owner'), async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const row = await Testimonial.findByIdAndUpdate(id, { $set: { status: 'rejected' } }, { new: true, runValidators: true }).lean();
  if (!row) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
  recordAuditEvent('testimonial_reject', req.admin!.id, { testimonialId: id });
  res.json({ item: { id, status: 'rejected' } });
});

testimonialAdminRouter.patch('/testimonials/:id', requireAdmin, requireRole('owner'), async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const input = updateSchema.parse(req.body ?? {});
  if (Object.keys(input).length === 0) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Nothing to update.' } });
    return;
  }
  if (input.status === 'approved') {
    const current = await Testimonial.findById(id).lean();
    if (!current) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
      return;
    }
    if (!current.consent && current.consentStatus !== 'confirmed') {
      res.status(422).json({ error: { code: 'CONSENT_REQUIRED', message: 'A testimonial cannot be approved without student consent.' } });
      return;
    }
  }
  if (input.photoAssetId) {
    const asset = await MediaAsset.findById(input.photoAssetId).select('purpose').lean();
    if (!asset || asset.purpose !== 'testimonial') {
      res.status(422).json({ error: { code: 'INVALID_IMAGE', message: 'The selected student photo is not valid.' } });
      return;
    }
  }
  const set: Record<string, unknown> = { ...input };
  if (input.review !== undefined) set.feedback = input.review;
  if (input.consent !== undefined) set.consentStatus = input.consent ? 'confirmed' : 'pending';
  const row = await Testimonial.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true }).lean();
  if (!row) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
    return;
  }
  recordAuditEvent('testimonial_update', req.admin!.id, { testimonialId: id, fields: Object.keys(set) });
  res.json({ item: { id, studentName: row.studentName, courseName: row.courseName, rating: row.rating, review: row.review || row.feedback, status: row.status, consent: row.consent } });
});

testimonialAdminRouter.delete('/testimonials/:id', requireAdmin, requireRole('owner'), async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const row = await Testimonial.findByIdAndDelete(id).lean();
  if (!row) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Testimonial not found.' } });
    return;
  }
  if (row.photoAssetId && Types.ObjectId.isValid(String(row.photoAssetId))) {
    await deleteAssetIfUnused(String(row.photoAssetId));
  }
  recordAuditEvent('testimonial_delete', req.admin!.id, { testimonialId: id });
  res.status(204).end();
});
