import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const MEDIA_PURPOSES = ['gallery', 'portrait', 'testimonial', 'fact-proof'] as const;
export type MediaPurpose = (typeof MEDIA_PURPOSES)[number];

// Metadata only. The image bytes live in the storage provider, never in MongoDB.
const mediaSchema = new Schema(
  {
    purpose: { type: String, enum: MEDIA_PURPOSES, required: true },
    // Random storage identifier. Storage keys are built from this, never from the user's file name.
    storageId: { type: String, required: true, unique: true, match: /^[a-f0-9]{32}$/ },
    displayName: { type: String, maxlength: 120, default: 'image' },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    bytes: { type: Number, required: true },
    variants: { type: [{ width: Number, bytes: Number, _id: false }], default: [] },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
);

export type MediaDoc = InferSchemaType<typeof mediaSchema>;
export const MediaAsset = mongoose.model('MediaAsset', mediaSchema);
