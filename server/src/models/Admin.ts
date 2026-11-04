import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },
    // Never returned unless a query explicitly selects it.
    passwordHash: { type: String, required: true, select: false },
    active: { type: Boolean, default: true },
    failedLogins: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

const adminSessionSchema = new Schema({
  // Only a SHA-256 hash of the session token is stored, so a database leak cannot be replayed.
  tokenHash: { type: String, required: true, unique: true },
  admin: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  // MongoDB removes expired sessions automatically.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = mongoose.model('AdminUser', adminUserSchema);
export const AdminSession = mongoose.model('AdminSession', adminSessionSchema);
