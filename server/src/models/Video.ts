import { Schema, model } from 'mongoose';

export const VIDEO_CATEGORIES = [
  'centre-tour', 'student-feedback', 'parent-feedback', 'course-demonstration',
  'events-activities', 'promotional', 'achievements', 'other',
] as const;
export const VIDEO_STATUSES = ['draft', 'published', 'archived'] as const;
export const VIDEO_CONSENT = ['pending', 'confirmed', 'withdrawn'] as const;

const videoSchema = new Schema({
  youtubeId: { type: String, required: true, unique: true, match: /^[A-Za-z0-9_-]{11}$/ },
  youtubeUrl: { type: String, required: true, maxlength: 500 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  category: { type: String, enum: VIDEO_CATEGORIES, required: true },
  status: { type: String, enum: VIDEO_STATUSES, default: 'draft', index: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, min: 0, max: 9999, default: 0 },
  consentStatus: { type: String, enum: VIDEO_CONSENT, default: 'pending', index: true },
  consentEvidence: { type: String, trim: true, maxlength: 300, default: '' },
  isMinor: { type: Boolean, default: false },
  guardianConsentConfirmed: { type: Boolean, default: false },
  guardianConsentConfirmedAt: Date,
  guardianConsentConfirmedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  consentConfirmedAt: Date,
  consentConfirmedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  consentWithdrawnAt: Date,
  consentWithdrawnBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
}, { timestamps: true });

videoSchema.index({ status: 1, consentStatus: 1, displayOrder: 1 });
videoSchema.index({ isFeatured: 1, status: 1 });
videoSchema.index({ isFeatured: 1 }, { unique: true, partialFilterExpression: { isFeatured: true } });
export const Video = model('Video', videoSchema);
