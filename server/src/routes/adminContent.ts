import { Router, type Request, type Response } from 'express';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { BusinessFact, Course, GalleryItem, LeadershipProfile, Testimonial } from '../models/Content.js';
import { MediaAsset } from '../models/Media.js';
import { purposeError } from '../media/format.js';
import { deleteAssetIfUnused } from '../media/service.js';
import { releasedImage } from '../media/reconcile.js';
import { contentSchemas, factKeySchema, updateFactSchema } from '../validators/content.js';
import { objectIdSchema } from '../validators/admin.js';
import { recordAuditEvent } from '../audit/record.js';

export const adminContentRouter = Router();

/** Fields that describe review state rather than content. They never count as a content change. */
export const REVIEW_KEYS = ['status', 'verification', 'displayOrder', 'photoPermission', 'permissionConfirmed'];

export type RuleResult = { ok: true; data: Record<string, unknown> } | { ok: false; message: string };

/** Two values are the same when their text forms match. Empty, missing and null all compare as empty. */
export const sameValue = (a: unknown, b: unknown): boolean => String(a ?? '') === String(b ?? '');

/** Content fields whose value differs from the stored record. A save that changes nothing is not an edit. */
export function changedContentKeys(input: Record<string, unknown>, current: Record<string, unknown>): string[] {
  return Object.keys(input).filter((k) => !REVIEW_KEYS.includes(k) && !sameValue(input[k], current[k]));
}

export interface ReviewContext {
  role?: 'owner' | 'staff';
  adminId?: string;
  isEdit: boolean;
  /** The stored record before this change. Empty for a new record. */
  current?: Record<string, unknown>;
}

const deny = (message: string): RuleResult => ({ ok: false, message });

/**
 * Verification and photo-permission rules for a content change. Pure, so the rules can be tested.
 * - Owner-only: verifying information and confirming photo permission.
 * - Any real content change returns the record to pending. An unchanged save leaves review state alone.
 * - A new or removed portrait always starts unconfirmed. A replacement gallery image needs fresh permission.
 */
export function buildReviewUpdate(input: Record<string, unknown>, ctx: ReviewContext): RuleResult {
  const data: Record<string, unknown> = { ...input };
  const cur = ctx.current ?? {};
  const isOwner = ctx.role === 'owner';
  const changed = ctx.isEdit ? changedContentKeys(input, cur) : [];
  const portraitChanged = changed.includes('portraitAssetId');
  const imageChanged = changed.includes('imageAssetId');

  // Verification
  if (input.verification === 'verified') {
    const alreadyVerified = ctx.isEdit && cur.verification === 'verified' && changed.length === 0;
    if (alreadyVerified) {
      delete data.verification;
    } else if (!isOwner) {
      return deny('Only the owner can verify information.');
    } else {
      data.verifiedAt = new Date();
      data.verifiedBy = ctx.adminId;
    }
  } else if (input.verification === 'pending') {
    if (ctx.isEdit && cur.verification === 'pending') delete data.verification;
    else {
      data.verifiedAt = null;
      data.verifiedBy = null;
    }
  } else if (changed.length > 0) {
    data.verification = 'pending';
    data.verifiedAt = null;
    data.verifiedBy = null;
  }

  // Portrait permission
  const requested = input.photoPermission;
  if (portraitChanged) {
    if (requested === 'confirmed') {
      if (!isOwner) return deny('Only the owner can confirm photo permission.');
      data.photoPermissionConfirmedAt = new Date();
      data.photoPermissionConfirmedBy = ctx.adminId;
    } else {
      data.photoPermission = 'unconfirmed';
      data.photoPermissionConfirmedAt = null;
      data.photoPermissionConfirmedBy = null;
    }
  } else if (requested === 'confirmed') {
    if (ctx.isEdit && cur.photoPermission === 'confirmed') delete data.photoPermission;
    else if (!isOwner) return deny('Only the owner can confirm photo permission.');
    else {
      data.photoPermissionConfirmedAt = new Date();
      data.photoPermissionConfirmedBy = ctx.adminId;
    }
  } else if (requested === 'unconfirmed') {
    if (ctx.isEdit && cur.photoPermission === 'unconfirmed') delete data.photoPermission;
    else {
      data.photoPermissionConfirmedAt = null;
      data.photoPermissionConfirmedBy = null;
    }
  }

  // Gallery publication permission is owner-only. Staff cannot confirm it by crafting an API request.
  if (input.permissionConfirmed === true && !isOwner && !(ctx.isEdit && cur.permissionConfirmed === true && !imageChanged)) {
    return deny('Only the owner can confirm permission to publish gallery photographs.');
  }
  if (imageChanged) data.permissionConfirmed = false;

  return { ok: true, data };
}

export interface FactContext {
  role?: 'owner' | 'staff';
  adminId?: string;
  current?: Record<string, unknown>;
}

/** Fact verification rules. A changed value returns to pending until the owner verifies it. */
export function buildFactUpdate(input: Record<string, unknown>, ctx: FactContext): RuleResult {
  const data: Record<string, unknown> = { ...input };
  const cur = ctx.current ?? {};
  const valueChanged = input.value !== undefined && !sameValue(input.value, cur.value);

  if (input.verification === 'verified') {
    if (cur.verification === 'verified' && !valueChanged) delete data.verification;
    else if (ctx.role !== 'owner') return deny('Only the owner can verify information.');
    else {
      data.verifiedAt = new Date();
      data.verifiedBy = ctx.adminId;
      data.verificationSource = input.verificationSource ?? 'owner-confirmed';
    }
  } else if (input.verification === 'pending') {
    if (cur.verification === 'pending') delete data.verification;
    else {
      data.verifiedAt = null;
      data.verifiedBy = null;
      data.verificationSource = 'none';
    }
  } else if (valueChanged) {
    data.verification = 'pending';
    data.verifiedAt = null;
    data.verifiedBy = null;
    data.verificationSource = 'none';
  } else if (input.value !== undefined) {
    delete data.value; // same value: nothing to write
  }
  return { ok: true, data };
}

function auditLog(action: string, adminId: string, extra: Record<string, unknown> = {}): void {
  recordAuditEvent(action, adminId, extra);
}

function forbid(res: Response, message: string): void {
  res.status(403).json({ error: { code: 'FORBIDDEN', message } });
}

function toView(row: unknown): Record<string, unknown> {
  const { __v: _v, ...rest } = row as Record<string, unknown> & { _id: unknown };
  const { _id, ...others } = rest;
  return { id: String(_id), ...others };
}

/** Checks that a referenced image exists and was uploaded for the right purpose. Returns an error message or null. */
async function checkAttachment(assetId: string, purpose: 'gallery' | 'portrait'): Promise<string | null> {
  const asset = await MediaAsset.findById(assetId).select('purpose').lean();
  if (!asset) return 'The selected image no longer exists. Upload it again.';
  return purposeError(asset.purpose, purpose);
}

interface MediaField {
  field: 'imageAssetId' | 'portraitAssetId';
  purpose: 'gallery' | 'portrait';
  nullable: boolean;
}

type Handler = (req: Request, res: Response) => Promise<void>;
type Schema = { parse: (v: unknown) => Record<string, unknown> };

function registerContent(path: string, model: Model<unknown>, schemas: { create: Schema; update: Schema }, media?: MediaField) {
  adminContentRouter.get(`/${path}`, requireAdmin, (async (_req, res) => {
    const rows = await model.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.json({ items: rows.map(toView) });
  }) as Handler);

  adminContentRouter.post(`/${path}`, requireAdmin, (async (req, res) => {
    const input = schemas.create.parse(req.body ?? {});
    if (media && typeof input[media.field] === 'string') {
      const err = await checkAttachment(String(input[media.field]), media.purpose);
      if (err) return void res.status(422).json({ error: { code: 'INVALID_IMAGE', message: err } });
    }
    const result = buildReviewUpdate(input, { role: req.admin?.role, adminId: req.admin?.id, isEdit: false });
    if (!result.ok) return forbid(res, result.message);
    const doc = await model.create(result.data);
    auditLog('content_create', req.admin!.id, { type: path, id: String(doc._id) });
    res.status(201).json({ item: toView(doc.toObject()) });
  }) as Handler);

  adminContentRouter.patch(`/${path}/:id`, requireAdmin, (async (req, res) => {
    const id = objectIdSchema.parse(req.params.id);
    const input = schemas.update.parse(req.body ?? {});
    const before = await model.findById(id).lean();
    if (!before) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found.' } });
    const current = before as unknown as Record<string, unknown>;

    // Only a real change to the image is validated and can release the previous image.
    const changingImage = !!media && media.field in input && !sameValue(input[media.field], current[media.field]);
    if (changingImage && media) {
      const value = input[media.field];
      if (value === null) {
        if (!media.nullable) return void res.status(422).json({ error: { code: 'INVALID_IMAGE', message: 'An image is required.' } });
      } else {
        const err = await checkAttachment(String(value), media.purpose);
        if (err) return void res.status(422).json({ error: { code: 'INVALID_IMAGE', message: err } });
      }
    }

    const result = buildReviewUpdate(input, { role: req.admin?.role, adminId: req.admin?.id, isEdit: true, current });
    if (!result.ok) return forbid(res, result.message);

    // The record is saved first. A replaced image is removed only afterwards, so no record points at a deleted image.
    const row =
      Object.keys(result.data).length > 0
        ? await model.findByIdAndUpdate(id, { $set: result.data }, { new: true, runValidators: true }).lean()
        : before;
    if (!row) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found.' } });

    if (changingImage && media) {
      const after = row as unknown as Record<string, unknown>;
      const oldId = current[media.field] ? String(current[media.field]) : null;
      const newId = after[media.field] ? String(after[media.field]) : null;
      const released = releasedImage(oldId, newId);
      if (released) await deleteAssetIfUnused(released);
    }
    auditLog('content_update', req.admin!.id, { type: path, id, fields: changedContentKeys(input, current) });
    res.json({ item: toView(row) });
  }) as Handler);
}

registerContent('courses', Course as unknown as Model<unknown>, contentSchemas.courses);
registerContent('leadership', LeadershipProfile as unknown as Model<unknown>, contentSchemas.leadership, { field: 'portraitAssetId', purpose: 'portrait', nullable: true });
registerContent('gallery', GalleryItem as unknown as Model<unknown>, contentSchemas.gallery, { field: 'imageAssetId', purpose: 'gallery', nullable: false });
registerContent('testimonials', Testimonial as unknown as Model<unknown>, contentSchemas.testimonials);

/** Deleting a gallery item removes the record first, then its image if nothing else uses it. Owner only. */
adminContentRouter.delete('/gallery/:id', requireAdmin, requireRole('owner'), (async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const item = await GalleryItem.findByIdAndDelete(id).lean();
  if (!item) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found.' } });
  const imageRemoved = Types.ObjectId.isValid(String(item.imageAssetId)) ? await deleteAssetIfUnused(String(item.imageAssetId)) : false;
  auditLog('gallery_delete', req.admin!.id, { id, imageRemoved });
  res.status(204).end();
}) as Handler);

adminContentRouter.get('/facts', requireAdmin, (async (_req, res) => {
  const rows = await BusinessFact.find({}).sort({ key: 1 }).lean();
  res.json({ items: rows.map(toView) });
}) as Handler);

adminContentRouter.patch('/facts/:key', requireAdmin, (async (req, res) => {
  const key = factKeySchema.parse(req.params.key);
  const input = updateFactSchema.parse(req.body ?? {});
  if (Object.keys(input).length === 0) return void res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Nothing to update.' } });
  const current = await BusinessFact.findOne({ key }).lean();
  if (!current) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Fact not found.' } });
  const result = buildFactUpdate(input, { role: req.admin?.role, adminId: req.admin?.id, current: current as unknown as Record<string, unknown> });
  if (!result.ok) return forbid(res, result.message);
  const row =
    Object.keys(result.data).length > 0
      ? await BusinessFact.findOneAndUpdate({ key }, { $set: result.data }, { new: true, runValidators: true }).lean()
      : current;
  auditLog('fact_update', req.admin!.id, { key, fields: Object.keys(input) });
  res.json({ item: toView(row) });
}) as Handler);
