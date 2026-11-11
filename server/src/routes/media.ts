import express, { Router, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { ACCEPTED_TYPES, parsePurpose, parseWidth, sanitizeDisplayName } from '../media/format.js';
import { MediaError } from '../media/pipeline.js';
import { assetView, createAsset, findReferences, deleteAssetIfUnused, streamVariant } from '../media/service.js';
import { previewWidth } from '../media/delivery.js';
import { MediaAsset } from '../models/Media.js';
import { recordAuditEvent } from '../audit/record.js';

export const mediaRouter = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many uploads. Please wait a few minutes and try again.' } },
});

// Only the listed image types are read, and the body is capped at the configured size.
const rawImage = express.raw({ type: [...ACCEPTED_TYPES], limit: `${env.MEDIA_MAX_UPLOAD_MB}mb` });

function fail(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

function auditLog(action: string, adminId: string, extra: Record<string, unknown> = {}): void {
  recordAuditEvent(action, adminId, extra);
}

mediaRouter.post('/media', requireAdmin, uploadLimiter, rawImage, async (req: Request, res: Response) => {
  const purpose = parsePurpose(req.query.purpose);
  if (!purpose) return fail(res, 400, 'INVALID_PURPOSE', 'Choose gallery, portrait, or fact-proof for this image.');
  if (!Buffer.isBuffer(req.body)) return fail(res, 415, 'UNSUPPORTED_TYPE', 'Upload a JPEG, PNG or WebP image.');
  if (req.body.length === 0) return fail(res, 400, 'EMPTY_FILE', 'The file is empty.');

  const rawName = req.get('X-Filename');
  const displayName = sanitizeDisplayName(rawName);
  try {
    const asset = await createAsset(req.body, purpose, displayName, req.admin!.id);
    auditLog('media_upload', req.admin!.id, { assetId: String(asset._id), purpose, bytes: req.body.length });
    res.status(201).json({ asset: assetView(asset) });
  } catch (err) {
    if (err instanceof MediaError) return fail(res, err.status, err.code, err.message);
    throw err;
  }
});

// Admin preview at the variant closest to 480 px. Registered before the width route, so "preview" is never read as a width.
mediaRouter.get('/media/:id/preview', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  if (!Types.ObjectId.isValid(req.params.id)) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  const asset = await MediaAsset.findById(req.params.id).select('storageId variants').lean();
  if (!asset) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  const width = previewWidth(asset.variants.map((v) => v.width).filter((w): w is number => typeof w === 'number'));
  if (width === null) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  await streamVariant(res, asset.storageId, width, 'private, no-store');
});

// Admin preview. Admins may view any image, including portraits that are not yet permitted for the public.
mediaRouter.get('/media/:id/:width', requireAdmin, async (req: Request<{ id: string; width: string }>, res: Response) => {
  const width = parseWidth(req.params.width);
  if (width === null || !Types.ObjectId.isValid(req.params.id)) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  const asset = await MediaAsset.findById(req.params.id).select('storageId variants').lean();
  if (!asset || !asset.variants.some((v) => v.width === width)) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  await streamVariant(res, asset.storageId, width, 'private, no-store');
});

// Owner-only deletion. Refused while any record uses the image, so no reference can be left broken.
mediaRouter.delete('/media/:id', requireAdmin, requireRole('owner'), async (req: Request<{ id: string }>, res: Response) => {
  if (!Types.ObjectId.isValid(req.params.id)) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  const asset = await MediaAsset.findById(req.params.id).select('_id').lean();
  if (!asset) return fail(res, 404, 'NOT_FOUND', 'Image not found.');
  const refs = await findReferences(String(asset._id));
  if (refs.total > 0) {
    const parts = [
      refs.galleryItems ? `${refs.galleryItems} gallery item${refs.galleryItems === 1 ? '' : 's'}` : '',
      refs.portraits ? 'a leadership profile' : '',
      refs.testimonials ? 'a testimonial' : '',
    ].filter(Boolean);
    return fail(res, 409, 'IMAGE_IN_USE', `This image is used by ${parts.join(' and ')}. Remove or replace it there first.`);
  }
  await deleteAssetIfUnused(String(asset._id));
  auditLog('media_delete', req.admin!.id, { assetId: String(asset._id) });
  res.status(204).end();
});
