import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const enquirySchema = new Schema(
  {
    studentName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
    qualification: { type: String, required: true, maxlength: 40 },
    interestedCourse: { type: String, required: true, maxlength: 80 },
    message: { type: String, maxlength: 500, default: '' },
    consent: {
      type: Boolean,
      required: true,
      validate: { validator: (v: boolean) => v === true, message: 'Consent is required' },
    },
    consentAt: { type: Date, required: true },
    sourcePage: { type: String, maxlength: 200, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'follow-up', 'admitted', 'rejected'],
      default: 'new',
      index: true,
    },
    statusUpdatedAt: { type: Date },
    statusUpdatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    // Internal staff notes are never returned unless a query explicitly selects them.
    internalNotes: { type: String, maxlength: 2000, default: '', select: false },
  },
  { timestamps: true },
);

enquirySchema.index({ mobile: 1, interestedCourse: 1, createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;
export const Enquiry = mongoose.model('Enquiry', enquirySchema);
