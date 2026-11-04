import { randomBytes } from 'node:crypto';
import { recordAuditEvent } from '../audit/record.js';
import bcrypt from 'bcryptjs';
import { Router, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { FilterQuery, Types, UpdateQuery } from 'mongoose';
import {
  SESSION_COOKIE, SESSION_MS, cookieOptions, requireAdmin, requireAdminHeader, sha256,
} from '../middleware/auth.js';
import { AdminSession, AdminUser } from '../models/Admin.js';
import { adminContentRouter } from './adminContent.js';
import { mediaRouter } from './media.js';
import { videoAdminRouter } from './videos.js';
import { Enquiry, type EnquiryDoc } from '../models/Enquiry.js';
import {
  ENQUIRY_STATUSES, listQuerySchema, loginSchema, objectIdSchema, updateEnquirySchema,
} from '../validators/admin.js';

const MAX_FAILED_LOGINS = 10;
const LOCK_MS = 15 * 60 * 1000;
// Compared against when the email is unknown, so response timing does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-real-password', 12);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' } },
});

interface LeanEnquiry {
  _id: Types.ObjectId;
  studentName: string;
  mobile: string;
  email: string;
  qualification: string;
  interestedCourse: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  statusUpdatedAt?: Date;
  internalNotes?: string;
}

const LIST_FIELDS = 'studentName mobile email qualification interestedCourse message status createdAt updatedAt statusUpdatedAt';

const toEnquiryView = (r: LeanEnquiry) => ({
  id: String(r._id),
  studentName: r.studentName,
  mobile: r.mobile,
  email: r.email,
  qualification: r.qualification,
  interestedCourse: r.interestedCourse,
  message: r.message,
  status: r.status,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  statusUpdatedAt: r.statusUpdatedAt,
  internalNotes: r.internalNotes,
});
const toViews = (rows: unknown[]) => rows.map((r) => toEnquiryView(r as LeanEnquiry));

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the Mongo filter from validated query values. Dates are interpreted in India Standard Time. */
function buildFilter(q: { q?: string; status?: string; course?: string; from?: string; to?: string }): FilterQuery<EnquiryDoc> {
  const filter: FilterQuery<EnquiryDoc> = {};
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    filter.$or = [{ studentName: rx }, { email: rx }, { interestedCourse: rx }, { mobile: rx }];
  }
  if (q.status) filter.status = q.status;
  if (q.course) filter.interestedCourse = q.course;
  const range: { $gte?: Date; $lte?: Date } = {};
  if (q.from) range.$gte = new Date(`${q.from}T00:00:00+05:30`);
  if (q.to) range.$lte = new Date(`${q.to}T23:59:59.999+05:30`);
  if (range.$gte || range.$lte) filter.createdAt = range;
  return filter;
}

function auditLog(action: string, adminId?: string, extra: Record<string, unknown> = {}): void {
  recordAuditEvent(action, adminId, extra);
}

function notFound(res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Enquiry not found.' } });
}

export const adminRouter = Router();

// Admin responses must never be cached by browsers or shared proxies.
adminRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
adminRouter.use(requireAdminHeader);

// There is intentionally no registration route. Admin accounts are created only by the server-side script.

adminRouter.post('/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body ?? {});

  const admin = await AdminUser.findOne({ email }).select('+passwordHash +failedLogins +lockUntil');
  const locked = !!admin?.lockUntil && admin.lockUntil.getTime() > Date.now();
  const passwordOk = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !admin.active || locked || !passwordOk) {
    if (admin && !locked) {
      const updated = await AdminUser.findByIdAndUpdate(admin._id, { $inc: { failedLogins: 1 } }, { new: true }).select('+failedLogins');
      if (updated && (updated.failedLogins ?? 0) >= MAX_FAILED_LOGINS) {
        await AdminUser.updateOne({ _id: admin._id }, { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MS) } });
      }
    }
    auditLog('login_failed');
    // Same message for every failure, so the response does not reveal whether an account exists or is locked.
    res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } });
    return;
  }

  await AdminUser.updateOne(
    { _id: admin._id },
    { $set: { failedLogins: 0, lastLoginAt: new Date() }, $unset: { lockUntil: 1 } },
  );

  // A fresh random token on every sign-in prevents session fixation. Only its hash is stored.
  const token = randomBytes(32).toString('base64url');
  await AdminSession.create({ tokenHash: sha256(token), admin: admin._id, expiresAt: new Date(Date.now() + SESSION_MS) });
  res.cookie(SESSION_COOKIE, token, cookieOptions(SESSION_MS));

  auditLog('login', String(admin._id));
  res.json({ admin: { id: String(admin._id), email: admin.email, name: admin.name, role: admin.role } });
});

adminRouter.post('/auth/logout', async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string') {
    await AdminSession.deleteOne({ tokenHash: sha256(token) });
  }
  res.clearCookie(SESSION_COOKIE, cookieOptions());
  auditLog('logout');
  res.status(204).end();
});

adminRouter.get('/auth/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

adminRouter.get('/enquiries/stats', requireAdmin, async (_req, res) => {
  const rows = await Enquiry.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0]));
  let total = 0;
  for (const row of rows) {
    counts[row._id] = row.count;
    total += row.count;
  }
  res.json({ total, counts });
});

adminRouter.get('/enquiries', requireAdmin, async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const filter = buildFilter(q);
  const [rows, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).select(LIST_FIELDS).lean(),
    Enquiry.countDocuments(filter),
  ]);
  res.json({
    items: toViews(rows),
    page: q.page,
    limit: q.limit,
    total,
    pages: Math.max(1, Math.ceil(total / q.limit)),
  });
});

adminRouter.get('/enquiries/:id', requireAdmin, async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const row = await Enquiry.findById(id).select('+internalNotes').lean();
  if (!row) {
    notFound(res);
    return;
  }
  res.json({ enquiry: toEnquiryView(row as unknown as LeanEnquiry) });
});

adminRouter.patch('/enquiries/:id', requireAdmin, async (req, res) => {
  const id = objectIdSchema.parse(req.params.id);
  const input = updateEnquirySchema.parse(req.body ?? {});
  const adminId = req.admin!.id;

  const set: Record<string, unknown> = {};
  if (input.status) {
    set.status = input.status;
    set.statusUpdatedAt = new Date();
    set.statusUpdatedBy = adminId;
  }
  if (input.internalNotes !== undefined) set.internalNotes = input.internalNotes;

  const row = await Enquiry.findByIdAndUpdate(id, { $set: set } as UpdateQuery<EnquiryDoc>, { new: true, runValidators: true })
    .select('+internalNotes')
    .lean();
  if (!row) {
    notFound(res);
    return;
  }

  auditLog('enquiry_update', adminId, { enquiryId: id, fields: Object.keys(set) });
  res.json({ enquiry: toEnquiryView(row as unknown as LeanEnquiry) });
});

// Content management endpoints share the same header guard, no-store headers and sign-in requirement.
adminRouter.use(adminContentRouter);
adminRouter.use(videoAdminRouter);
adminRouter.use(mediaRouter);
