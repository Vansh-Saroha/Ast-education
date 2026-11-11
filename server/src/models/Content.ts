import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export const VERIFICATION_STATUSES = ['pending', 'verified'] as const;
export const VERIFICATION_SOURCES = ['owner-confirmed', 'document-checked', 'none'] as const;
export const PHOTO_PERMISSIONS = ['unconfirmed', 'confirmed'] as const;
export const COURSE_CATEGORIES = ['school', 'higher', 'computer', 'technical', 'personality'] as const;
export const GALLERY_CATEGORIES = [
  'institute-building', 'classrooms', 'computer-lab', 'faculty', 'students', 'educational-activities', 'events',
] as const;

// A record is public only when status is "published" AND verification is "verified".
const reviewFields = {
  status: { type: String, enum: CONTENT_STATUSES, default: 'draft', index: true },
  verification: { type: String, enum: VERIFICATION_STATUSES, default: 'pending', index: true },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  displayOrder: { type: Number, default: 0 },
};

const courseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80, unique: true },
    category: { type: String, enum: COURSE_CATEGORIES, required: true },
    description: { type: String, maxlength: 1000, default: 'Detailed course information will be updated by the institute.' },
    ...reviewFields,
  },
  { timestamps: true },
);

const leadershipSchema = new Schema(
  {
    profileType: { type: String, enum: ['director', 'manager'], required: true, unique: true },
    designation: { type: String, required: true, trim: true, maxlength: 80 },
    name: { type: String, trim: true, maxlength: 80, default: '' },
    qualifications: { type: String, maxlength: 2000, default: '' },
    experience: { type: String, maxlength: 2000, default: '' },
    biography: { type: String, maxlength: 4000, default: '' },
    responsibilities: { type: String, maxlength: 2000, default: '' },
    skills: { type: String, maxlength: 2000, default: '' },
    teachingManagement: { type: String, maxlength: 2000, default: '' },
    achievements: { type: String, maxlength: 2000, default: '' },
    visionMission: { type: String, maxlength: 2000, default: '' },
    studentMessage: { type: String, maxlength: 2000, default: '' },
    quote: { type: String, maxlength: 1000, default: '' },
    // Portrait image, held in the media store. Served publicly only when photo permission is confirmed.
    portraitAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    photoPermission: { type: String, enum: PHOTO_PERMISSIONS, default: 'unconfirmed' },
    photoPermissionConfirmedAt: { type: Date },
    photoPermissionConfirmedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    ...reviewFields,
  },
  { timestamps: true },
);

const galleryItemSchema = new Schema(
  {
    category: { type: String, enum: GALLERY_CATEGORIES, required: true },
    caption: { type: String, maxlength: 160, default: '' },
    altText: { type: String, required: true, maxlength: 200 },
    imageAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', required: true },
    permissionConfirmed: { type: Boolean, default: false },
    ...reviewFields,
  },
  { timestamps: true },
);

const testimonialSchema = new Schema(
  {
    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    courseName: { type: String, maxlength: 80, default: '' },
    feedback: { type: String, maxlength: 1000, default: '' },
    review: { type: String, maxlength: 1000, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    photoAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    photo: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    consent: { type: Boolean, required: true, default: false },
    consentStatus: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const businessFactSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, maxlength: 40 },
    label: { type: String, required: true, maxlength: 80 },
    value: { type: String, maxlength: 300, default: '' },
    note: { type: String, maxlength: 500, default: '' },
    publicVisibility: { type: Boolean, default: true, index: true },
    custom: { type: Boolean, default: false, index: true },
    proofAssetId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    verificationType: { type: String, enum: ['owner-confirmed', 'independently-verified'], default: 'owner-confirmed' },
    verification: { type: String, enum: VERIFICATION_STATUSES, default: 'pending', index: true },
    verificationSource: { type: String, enum: VERIFICATION_SOURCES, default: 'none' },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export type CourseDoc = InferSchemaType<typeof courseSchema>;
export const Course = mongoose.model('Course', courseSchema);
export const LeadershipProfile = mongoose.model('LeadershipProfile', leadershipSchema);
export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export const BusinessFact = mongoose.model('BusinessFact', businessFactSchema);
