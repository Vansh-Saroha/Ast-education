// Creates an admin account. There is no public registration; run this on the server only.
// Usage: ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... npm run admin:create
// Tip: read the password without echoing it, then export it:  read -s ADMIN_PASSWORD && export ADMIN_PASSWORD
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { AdminUser } from '../models/Admin.js';

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const name = (process.env.ADMIN_NAME ?? '').trim();
const password = process.env.ADMIN_PASSWORD ?? '';
const role = process.env.ADMIN_ROLE === 'staff' ? 'staff' : 'owner';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('ADMIN_EMAIL is missing or not a valid email address.');
if (name.length < 2 || name.length > 80) fail('ADMIN_NAME must be 2 to 80 characters.');
if (password.length < 12) fail('ADMIN_PASSWORD must be at least 12 characters.');
if (Buffer.byteLength(password, 'utf8') > 72) fail('ADMIN_PASSWORD must be 72 bytes or fewer.');
if (password.toLowerCase().includes(email.split('@')[0])) fail('ADMIN_PASSWORD must not contain the email name.');

await connectDb();

if (await AdminUser.exists({ email })) {
  fail('An admin with this email already exists. Nothing was changed.');
}

const passwordHash = await bcrypt.hash(password, 12);
await AdminUser.create({ email, name, role, passwordHash, active: true });
console.log(`Admin account created for ${email} with role "${role}".`);

await mongoose.disconnect();
