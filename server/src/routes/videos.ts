import { Router, type Request, type Response } from 'express';
import { requireAdmin, requireRole } from '../middleware/auth.js';
import { Video } from '../models/Video.js';
import { createVideoSchema, getYouTubeId, updateVideoSchema } from '../validators/video.js';
import { objectIdSchema } from '../validators/admin.js';
import { recordAuditEvent } from '../audit/record.js';

export const videoAdminRouter = Router();
type Handler = (req: Request, res: Response) => Promise<void>;
const forbidden = (res: Response, message: string) => res.status(403).json({ error: { code: 'FORBIDDEN', message } });
const view = (doc: Record<string, unknown>) => {
  const { _id, __v: _v, ...rest } = doc;
  return { id: String(_id), ...rest, embedUrl: `https://www.youtube-nocookie.com/embed/${String(doc.youtubeId)}`, thumbnailUrl: `https://i.ytimg.com/vi/${String(doc.youtubeId)}/hqdefault.jpg` };
};
const log = (action: string, adminId: string, videoId: string) => recordAuditEvent(action, adminId, { videoId });

videoAdminRouter.get('/videos', requireAdmin, (async (_req, res) => {
  const rows = await Video.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
  res.json({ items: rows.map((r) => view(r as unknown as Record<string, unknown>)) });
}) as Handler);

videoAdminRouter.post('/videos', requireAdmin, (async (req, res) => {
  const input = createVideoSchema.parse(req.body ?? {});
  const isOwner = req.admin?.role === 'owner';
  if (!isOwner && (input.status !== 'draft' || input.isFeatured || input.consentStatus !== 'pending' || input.guardianConsentConfirmed)) {
    return void forbidden(res, 'Staff can create draft videos only. Owner approval is required to publish or confirm consent.');
  }
  const youtubeId = getYouTubeId(input.youtubeUrl)!;
  if (input.consentStatus === 'confirmed' && (!isOwner || !input.consentEvidence || (input.isMinor && !input.guardianConsentConfirmed))) {
    return void forbidden(res, 'Owner confirmation and documented consent are required before publishing.');
  }
  if (input.status === 'published' && input.consentStatus !== 'confirmed') return void forbidden(res, 'Video cannot be published until consent is confirmed.');
  if (input.isFeatured && (input.status !== 'published' || input.consentStatus !== 'confirmed' || (input.isMinor && !input.guardianConsentConfirmed))) return void forbidden(res, 'Only a published, consent-cleared video can be featured.');
  const makeFeatured = input.isFeatured;
  const doc = await Video.create({ ...input, youtubeId, isFeatured: false, guardianConsentConfirmedAt: input.guardianConsentConfirmed ? new Date() : undefined, guardianConsentConfirmedBy: input.guardianConsentConfirmed ? req.admin!.id : undefined, consentConfirmedAt: input.consentStatus === 'confirmed' ? new Date() : undefined, consentConfirmedBy: input.consentStatus === 'confirmed' ? req.admin!.id : undefined, createdBy: req.admin!.id, updatedBy: req.admin!.id });
  if (makeFeatured) {
    await Video.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    await Video.updateOne({ _id: doc._id }, { $set: { isFeatured: true } });
  }
  const saved = makeFeatured ? await Video.findById(doc._id).lean() : doc.toObject();
  log('video_create', req.admin!.id, String(doc._id));
  res.status(201).json({ item: view(saved as unknown as Record<string, unknown>) });
}) as Handler);

videoAdminRouter.patch('/videos/:id', requireAdmin, (async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const input = updateVideoSchema.parse(req.body ?? {});
  const current = await Video.findById(id).lean();
  if (!current) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Video not found.' } });
  const owner = req.admin?.role === 'owner';
  const data: Record<string, unknown> = { ...input, updatedBy: req.admin!.id };
  if (input.status && input.status !== 'published') data.isFeatured = false;
  const nextUrl = input.youtubeUrl ?? current.youtubeUrl;
  const nextId = getYouTubeId(nextUrl)!;
  const urlChanged = nextId !== current.youtubeId;
  if (urlChanged && await Video.exists({ youtubeId: nextId, _id: { $ne: id } })) return void res.status(409).json({ error: { code: 'DUPLICATE_VIDEO', message: 'This YouTube video has already been added.' } });
  if (urlChanged) {
    data.youtubeId = nextId;
    data.consentStatus = 'pending';
    data.consentConfirmedAt = null;
    data.consentConfirmedBy = null;
    data.status = 'draft';
    data.isFeatured = false;
  }
  if (!owner) {
    // Staff edits are submissions, not publication: return changed content to draft for owner review.
    const substantiveKeys = ['youtubeUrl', 'title', 'description', 'category', 'displayOrder'];
    if (substantiveKeys.some((key) => key in input)) { data.status = 'draft'; data.isFeatured = false; }
    if (input.status && input.status !== current.status) return void forbidden(res, 'Only the owner can change a video publication status.');
    if (input.isFeatured !== undefined && input.isFeatured !== current.isFeatured) return void forbidden(res, 'Only the owner can feature videos.');
    if (input.consentStatus && input.consentStatus !== current.consentStatus) return void forbidden(res, 'Only the owner can confirm or withdraw consent.');
    if (input.guardianConsentConfirmed !== undefined && input.guardianConsentConfirmed !== current.guardianConsentConfirmed) return void forbidden(res, 'Only the owner can confirm guardian consent.');
    if (input.isMinor !== undefined && input.isMinor !== current.isMinor) return void forbidden(res, 'Only the owner can classify videos involving minors.');
    if (input.consentEvidence !== undefined && input.consentEvidence !== current.consentEvidence) return void forbidden(res, 'Only the owner can record consent evidence.');
    if (urlChanged) { data.consentStatus = 'pending'; data.status = 'draft'; data.isFeatured = false; }
  }
  const consent = String(data.consentStatus ?? current.consentStatus);
  const isMinor = Boolean(data.isMinor ?? current.isMinor);
  const guardian = Boolean(data.guardianConsentConfirmed ?? current.guardianConsentConfirmed);
  const evidence = String(data.consentEvidence ?? current.consentEvidence ?? '');
  let status = String(data.status ?? current.status);
  if (consent === 'confirmed' && (!owner || !evidence || (isMinor && !guardian))) return void forbidden(res, 'Documented consent is required; minors also require parent or guardian consent.');
  if (consent === 'withdrawn') {
    if (!owner) return void forbidden(res, 'Only the owner can withdraw consent.');
    data.status = 'draft'; data.isFeatured = false; status = 'draft'; data.consentWithdrawnAt = new Date(); data.consentWithdrawnBy = req.admin!.id;
  }
  if (status === 'published' && consent !== 'confirmed') return void forbidden(res, 'Video cannot be published until consent is confirmed.');
  if (status === 'published' && isMinor && !guardian) return void forbidden(res, 'Parent or guardian consent is required for a minor.');
  const featured = Boolean(data.isFeatured ?? current.isFeatured);
  if (featured && (status !== 'published' || consent !== 'confirmed' || (isMinor && !guardian))) return void forbidden(res, 'Only a published, consent-cleared video can be featured.');
  if (featured && !current.isFeatured) await Video.updateMany({ isFeatured: true, _id: { $ne: id } }, { $set: { isFeatured: false } });
  if (input.consentStatus === 'confirmed' && current.consentStatus !== 'confirmed') { data.consentConfirmedAt = new Date(); data.consentConfirmedBy = req.admin!.id; data.consentWithdrawnAt = null; data.consentWithdrawnBy = null; }
  if (input.consentStatus === 'pending' && current.consentStatus === 'confirmed') { data.consentConfirmedAt = null; data.consentConfirmedBy = null; }
  if (input.guardianConsentConfirmed === true && !current.guardianConsentConfirmed) { data.guardianConsentConfirmedAt = new Date(); data.guardianConsentConfirmedBy = req.admin!.id; }
  if (input.guardianConsentConfirmed === false && current.guardianConsentConfirmed) { data.guardianConsentConfirmedAt = null; data.guardianConsentConfirmedBy = null; }
  const row = await Video.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  if (!row) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Video not found.' } });
  log('video_update', req.admin!.id, id);
  res.json({ item: view(row as unknown as Record<string, unknown>) });
}) as Handler);

videoAdminRouter.delete('/videos/:id', requireAdmin, requireRole('owner'), (async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const row = await Video.findByIdAndDelete(id).lean();
  if (!row) return void res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Video not found.' } });
  log('video_delete', req.admin!.id, id);
  res.status(204).end();
}) as Handler);
