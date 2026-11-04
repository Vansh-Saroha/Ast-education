// Run with: npm test. Unit tests for the authorization guards, called directly with minimal request and response objects.
import assert from 'node:assert/strict';
import { requireAdmin, requireAdminHeader, requireRole } from '../src/middleware/auth.js';

interface FakeRes {
  statusCode?: number;
  body?: unknown;
  status(code: number): FakeRes;
  json(body: unknown): FakeRes;
  clearCookie(): void;
}

const fakeRes = (): FakeRes => ({
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  clearCookie() {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeReq = (over: Record<string, unknown>): any => ({
  method: 'GET',
  cookies: {},
  headers: {},
  get(name: string) {
    return (this.headers as Record<string, string>)[name.toLowerCase()];
  },
  ...over,
});

// 1. Role guard: only the owner passes the owner-only check
for (const [role, passes] of [['owner', true], ['staff', false]] as const) {
  const res = fakeRes();
  let called = false;
  requireRole('owner')(fakeReq({ admin: { id: 'x', email: 'e', name: 'n', role } }), res as never, () => {
    called = true;
  });
  assert.equal(called, passes, `${role} ${passes ? 'passes' : 'is refused'} the owner-only guard`);
  if (!passes) assert.equal(res.statusCode, 403, 'refusal is 403');
}
{
  const res = fakeRes();
  let called = false;
  requireRole('owner')(fakeReq({}), res as never, () => {
    called = true;
  });
  assert.equal(called, false, 'an unauthenticated request never passes the owner-only guard');
  assert.equal(res.statusCode, 403);
}

// 2. Header guard: safe methods pass; state-changing methods need the custom header
for (const method of ['GET', 'HEAD']) {
  let called = false;
  requireAdminHeader(fakeReq({ method }), fakeRes() as never, () => {
    called = true;
  });
  assert.equal(called, true, `${method} needs no header`);
}
for (const method of ['POST', 'PATCH', 'DELETE']) {
  const res = fakeRes();
  let called = false;
  requireAdminHeader(fakeReq({ method }), res as never, () => {
    called = true;
  });
  assert.equal(called, false, `${method} without the header is refused`);
  assert.equal(res.statusCode, 403);

  let passed = false;
  requireAdminHeader(fakeReq({ method, headers: { 'x-admin-request': '1' } }), fakeRes() as never, () => {
    passed = true;
  });
  assert.equal(passed, true, `${method} with the header passes`);
}
{
  const res = fakeRes();
  requireAdminHeader(fakeReq({ method: 'PATCH', headers: { 'x-admin-request': 'yes' } }), res as never, () => undefined);
  assert.equal(res.statusCode, 403, 'the header must be exactly "1"');
}

// 3. Session guard: refuses before any database lookup when no usable token is present
{
  const res = fakeRes();
  let called = false;
  await requireAdmin(fakeReq({ cookies: {} }), res as never, () => {
    called = true;
  });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401, 'missing cookie is refused');
}
{
  const res = fakeRes();
  await requireAdmin(fakeReq({ cookies: { ast_admin: 'short' } }), res as never, () => undefined);
  assert.equal(res.statusCode, 401, 'a malformed token is refused without a lookup');
}

console.log('All authorization tests passed.');
