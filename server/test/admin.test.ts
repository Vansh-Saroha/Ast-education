// Run with: npm test. These cases never reach the database, so they run without MongoDB.
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { listQuerySchema, loginSchema, updateEnquirySchema } from '../src/validators/admin.js';

// 1. Input schemas
assert.equal(loginSchema.safeParse({ email: 'admin@example.com', password: '' }).success, false, 'empty password');
assert.equal(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success, false, 'bad email');
assert.equal(loginSchema.safeParse({ email: 'a@example.com', password: 'x', role: 'owner' }).success, false, 'unknown field');
assert.equal(loginSchema.safeParse({ email: 'a@example.com', password: 'x'.repeat(73) }).success, false, 'password over 72 bytes');
assert.equal(listQuerySchema.safeParse({ limit: '500' }).success, false, 'limit above maximum');
assert.equal(listQuerySchema.safeParse({ status: 'closed' }).success, false, 'retired status rejected');
assert.equal(listQuerySchema.safeParse({ from: '2026-13-45' }).success, false, 'impossible date');
assert.equal(listQuerySchema.parse({}).page, 1, 'defaults applied');
assert.equal(updateEnquirySchema.safeParse({}).success, false, 'empty update rejected');
assert.equal(updateEnquirySchema.safeParse({ status: 'admitted' }).success, true, 'valid status update');
assert.equal(updateEnquirySchema.safeParse({ status: 'admitted', mobile: '9876543210' }).success, false, 'extra field rejected');

// 2. HTTP protection
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const json = { 'content-type': 'application/json' };

try {
  // Unauthenticated reads are refused and never cached
  const list = await fetch(`${base}/api/admin/enquiries`);
  assert.equal(list.status, 401);
  assert.equal(list.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(`${base}/api/admin/enquiries/stats`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/auth/me`)).status, 401);

  // A forged cookie of the wrong shape is refused before any database lookup
  const forged = await fetch(`${base}/api/admin/enquiries`, { headers: { cookie: 'ast_admin=short' } });
  assert.equal(forged.status, 401);

  // State-changing requests without the custom header are refused (CSRF guard runs first)
  const noHeader = await fetch(`${base}/api/admin/auth/login`, { method: 'POST', headers: json, body: '{}' });
  assert.equal(noHeader.status, 403);
  const patchNoHeader = await fetch(`${base}/api/admin/enquiries/507f1f77bcf86cd799439011`, {
    method: 'PATCH', headers: { ...json, cookie: 'ast_admin=' + 'a'.repeat(40) }, body: '{"status":"admitted"}',
  });
  assert.equal(patchNoHeader.status, 403);

  // Logout works without a session and clears the cookie
  const logout = await fetch(`${base}/api/admin/auth/logout`, { method: 'POST', headers: { 'X-Admin-Request': '1' } });
  assert.equal(logout.status, 204);

  // Invalid login bodies are rejected before any database work; five failures are allowed, the sixth is limited
  const bad = { 'X-Admin-Request': '1', ...json };
  for (let i = 0; i < 5; i++) {
    assert.equal((await fetch(`${base}/api/admin/auth/login`, { method: 'POST', headers: bad, body: '{"email":"x"}' })).status, 400);
  }
  assert.equal((await fetch(`${base}/api/admin/auth/login`, { method: 'POST', headers: bad, body: '{"email":"x"}' })).status, 429);

  // There is no public registration route
  const register = await fetch(`${base}/api/admin/register`, { method: 'POST', headers: { 'X-Admin-Request': '1', ...json }, body: '{}' });
  assert.equal(register.status, 404);

  // Global security headers are present
  const headers = await fetch(`${base}/api/health`);
  assert.equal(headers.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.headers.get('x-powered-by'), null);

  console.log('All admin tests passed.');
} finally {
  server.close();
}
