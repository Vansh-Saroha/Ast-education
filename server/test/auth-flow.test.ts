// Run with: npm test. Exercises login and session cookies without writing an admin to MongoDB.
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { createApp } from '../src/app.js';
import { sha256 } from '../src/middleware/auth.js';
import { AdminSession, AdminUser } from '../src/models/Admin.js';
import { AuditEvent } from '../src/models/AuditEvent.js';

type SessionRecord = { tokenHash: string; admin: Types.ObjectId; expiresAt: Date };
type AdminRecord = {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: 'owner';
  passwordHash: string;
  active: boolean;
  failedLogins: number;
};

const admin: AdminRecord = {
  _id: new Types.ObjectId(),
  email: 'owner@example.test',
  name: 'Test Owner',
  role: 'owner',
  passwordHash: bcrypt.hashSync('correct-test-password', 4),
  active: true,
  failedLogins: 0,
};
const sessions = new Map<string, SessionRecord>();
const userStatics = AdminUser as unknown as Record<string, unknown>;
const sessionStatics = AdminSession as unknown as Record<string, unknown>;
const auditStatics = AuditEvent as unknown as Record<string, unknown>;
const originals = {
  findOne: userStatics.findOne,
  findByIdAndUpdate: userStatics.findByIdAndUpdate,
  updateOne: userStatics.updateOne,
  findById: userStatics.findById,
  createSession: sessionStatics.create,
  findSession: sessionStatics.findOne,
  deleteSession: sessionStatics.deleteOne,
  createAuditEvent: auditStatics.create,
};

userStatics.findOne = () => ({ select: async () => admin });
userStatics.findByIdAndUpdate = () => ({
  select: async () => {
    admin.failedLogins += 1;
    return admin;
  },
});
userStatics.updateOne = async (_filter: unknown, update: { $set?: { failedLogins?: number } }) => {
  if (update.$set?.failedLogins !== undefined) admin.failedLogins = update.$set.failedLogins;
};
userStatics.findById = (id: Types.ObjectId) => ({
  select: () => ({
    lean: async () => String(id) === String(admin._id) ? admin : null,
  }),
});
sessionStatics.create = async (session: SessionRecord) => {
  sessions.set(session.tokenHash, session);
  return session;
};
sessionStatics.findOne = (filter: { tokenHash: string; expiresAt: { $gt: Date } }) => ({
  lean: async () => {
    const session = sessions.get(filter.tokenHash);
    return session && session.expiresAt > filter.expiresAt.$gt ? session : null;
  },
});
sessionStatics.deleteOne = async (filter: { tokenHash: string }) => {
  sessions.delete(filter.tokenHash);
};
auditStatics.create = () => ({ catch: () => undefined });

const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const login = (password: string) => fetch(`${base}/api/admin/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-admin-request': '1' },
  body: JSON.stringify({ email: 'owner@example.test', password }),
});
const cookieFrom = (response: Response): string => {
  const setCookie = response.headers.get('set-cookie');
  assert.ok(setCookie, 'login sends a session cookie');
  return setCookie.split(';', 1)[0];
};
const sessionGet = (cookie: string) => fetch(`${base}/api/admin/auth/me`, { headers: { cookie } });

try {
  const badPassword = await login('incorrect-test-password');
  assert.equal(badPassword.status, 401, 'an incorrect password is refused');
  assert.equal(badPassword.headers.get('set-cookie'), null, 'a failed login does not create a cookie');

  const firstLogin = await login('correct-test-password');
  assert.equal(firstLogin.status, 200, 'valid credentials sign in');
  const firstCookieHeader = firstLogin.headers.get('set-cookie')!;
  const firstCookie = cookieFrom(firstLogin);
  assert.match(firstCookieHeader, /;\s*Path=\//i, 'the session cookie uses the root path');
  assert.match(firstCookieHeader, /;\s*HttpOnly/i, 'the session cookie is HttpOnly');
  assert.match(firstCookieHeader, /;\s*SameSite=Strict/i, 'the session cookie is SameSite=Strict');
  assert.match(firstCookieHeader, /;\s*Max-Age=28800/i, 'the browser cookie lasts eight hours');
  assert.doesNotMatch(firstCookieHeader, /;\s*Domain=/i, 'the cookie remains host-only');
  const loginBody = await firstLogin.json() as { admin: { id: string; role: string }; token?: string };
  assert.equal(loginBody.admin.id, String(admin._id));
  assert.equal(loginBody.admin.role, 'owner');
  assert.equal(loginBody.token, undefined, 'the raw session token is never returned in JSON');

  const refreshed = await sessionGet(firstCookie);
  assert.equal(refreshed.status, 200, 'the session survives a page-refresh-style /me request');
  assert.equal((await refreshed.json() as { admin: { email: string } }).admin.email, admin.email);

  const secondLogin = await login('correct-test-password');
  assert.equal(secondLogin.status, 200, 'a second device can create its own session');
  const secondCookie = cookieFrom(secondLogin);
  assert.notEqual(firstCookie, secondCookie, 'each login receives an independent session token');
  assert.equal((await sessionGet(secondCookie)).status, 200, 'the second device session is valid');

  const logout = await fetch(`${base}/api/admin/auth/logout`, {
    method: 'POST',
    headers: { cookie: firstCookie, 'x-admin-request': '1' },
  });
  assert.equal(logout.status, 204, 'logout succeeds');
  assert.match(logout.headers.get('set-cookie') ?? '', /;\s*HttpOnly/i, 'logout clears the HttpOnly cookie');
  assert.equal((await sessionGet(firstCookie)).status, 401, 'the logged-out session is rejected');
  assert.equal((await sessionGet(secondCookie)).status, 200, 'logging out one device leaves the other signed in');

  const secondToken = secondCookie.split('=', 2)[1];
  const secondSession = sessions.get(sha256(secondToken));
  assert.ok(secondSession);
  secondSession.expiresAt = new Date(Date.now() - 1);
  assert.equal((await sessionGet(secondCookie)).status, 401, 'an expired session is rejected');

  console.log('All authentication flow tests passed.');
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  userStatics.findOne = originals.findOne;
  userStatics.findByIdAndUpdate = originals.findByIdAndUpdate;
  userStatics.updateOne = originals.updateOne;
  userStatics.findById = originals.findById;
  sessionStatics.create = originals.createSession;
  sessionStatics.findOne = originals.findSession;
  sessionStatics.deleteOne = originals.deleteSession;
  auditStatics.create = originals.createAuditEvent;
}
