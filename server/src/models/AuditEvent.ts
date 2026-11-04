import mongoose, { Schema, type InferSchemaType } from 'mongoose';

// Administrative activity metadata only. Never store enquiry contents or contact details here.
const auditEventSchema = new Schema(
  {
    action: { type: String, required: true, maxlength: 80, index: true },
    adminId: { type: String, default: null, maxlength: 64, index: true },
    targetId: { type: String, default: null, maxlength: 64 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { versionKey: false },
);

auditEventSchema.index({ occurredAt: -1, action: 1 });
export type AuditEventDoc = InferSchemaType<typeof auditEventSchema>;
export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
