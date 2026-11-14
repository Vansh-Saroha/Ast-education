// Run with: npm test. Sends real HTTP requests with explicit Origin and preflight headers. Needs no database.
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { createApp } from '../src/app.js';

const ALLOWED = 'http://localhost:5173';
const PATH = '/api/admin/enquiries/507f1f77bcf86cd799439011';

const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const port = (server.address() as { port: number }).port;

interface Reply {
  status: number;
  headers: Record<string, string | string[] | undefined>;
}

function send(method: string, headers: Record<string, string>, body?: string, path = PATH): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      res.resume();
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

const preflight = (origin: string, requestHeaders = 'content-type,x-admin-request') =>
  send('OPTIONS', { Origin: origin, 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': requestHeaders });

try {
  // 1. A cross-origin PATCH from an allowed origin is permitted by the preflight
  const ok = await preflight(ALLOWED);
  assert.equal(ok.status, 204, 'preflight succeeds');
  assert.equal(ok.headers['access-control-allow-origin'], ALLOWED, 'allowed origin is echoed');
  assert.equal(ok.headers['access-control-allow-credentials'], 'true', 'allowed origins may send session cookies');
  assert.match(String(ok.headers['access-control-allow-methods']), /\bPATCH\b/, 'PATCH is an allowed method');
  assert.match(String(ok.headers['access-control-allow-methods']), /\bGET\b/, 'existing methods are kept');
  assert.match(String(ok.headers['access-control-allow-methods']), /\bPOST\b/, 'existing methods are kept');
  assert.match(String(ok.headers['access-control-allow-headers']).toLowerCase(), /x-admin-request/, 'the admin header is allowed');
  assert.match(String(ok.headers['access-control-allow-headers']).toLowerCase(), /content-type/, 'JSON bodies are allowed');

  // 2. The origin allowlist still applies
  const denied = await preflight('https://evil.example');
  assert.equal(denied.headers['access-control-allow-origin'], undefined, 'unlisted origins receive no permission');

  // 3. Headers outside the explicit list are not granted
  const unlisted = await preflight(ALLOWED, 'x-custom-secret');
  assert.doesNotMatch(String(unlisted.headers['access-control-allow-headers'] ?? ''), /x-custom-secret/, 'unlisted headers are not granted');

  // 4. Permission to send is not permission to write: the security checks still run on the real request
  const noHeader = await send('PATCH', { Origin: ALLOWED, 'Content-Type': 'application/json' }, '{"status":"admitted"}');
  assert.equal(noHeader.status, 403, 'a cross-origin PATCH without X-Admin-Request is refused');
  assert.equal(noHeader.headers['access-control-allow-origin'], ALLOWED, 'the refusal still reaches the allowed origin');

  const noSession = await send('PATCH', { Origin: ALLOWED, 'Content-Type': 'application/json', 'X-Admin-Request': '1' }, '{"status":"admitted"}');
  assert.equal(noSession.status, 401, 'a cross-origin PATCH without a session is refused');

  // 5. Requests from a disallowed origin get no CORS permission, even when they carry the header
  const hostile = await send('PATCH', { Origin: 'https://evil.example', 'Content-Type': 'application/json', 'X-Admin-Request': '1' }, '{}');
  assert.equal(hostile.headers['access-control-allow-origin'], undefined, 'a hostile origin is not echoed');

  // 6. DELETE: allowed from the approved origin, refused for other origins, and still subject to the header and session checks
  const DELETE_PATH = '/api/admin/media/507f1f77bcf86cd799439011';
  const deletePreflight = (origin: string) =>
    send('OPTIONS', { Origin: origin, 'Access-Control-Request-Method': 'DELETE', 'Access-Control-Request-Headers': 'x-admin-request' }, undefined, DELETE_PATH);

  const deleteOk = await deletePreflight(ALLOWED);
  assert.equal(deleteOk.status, 204, 'DELETE preflight from an approved origin succeeds');
  assert.equal(deleteOk.headers['access-control-allow-origin'], ALLOWED, 'the approved origin is echoed for DELETE');
  assert.match(String(deleteOk.headers['access-control-allow-methods']), /\bDELETE\b/, 'DELETE is an allowed method');
  assert.match(String(deleteOk.headers['access-control-allow-methods']), /\bPATCH\b/, 'PATCH is still allowed');
  assert.match(String(deleteOk.headers['access-control-allow-headers']).toLowerCase(), /x-admin-request/, 'the admin header is still allowed');

  const deleteDenied = await deletePreflight('https://evil.example');
  assert.equal(deleteDenied.headers['access-control-allow-origin'], undefined, 'DELETE from an unapproved origin receives no CORS permission');

  const deleteNoHeader = await send('DELETE', { Origin: ALLOWED }, undefined, DELETE_PATH);
  assert.equal(deleteNoHeader.status, 403, 'a DELETE without X-Admin-Request is rejected');

  const deleteNoSession = await send('DELETE', { Origin: ALLOWED, 'X-Admin-Request': '1' }, undefined, DELETE_PATH);
  assert.equal(deleteNoSession.status, 401, 'a DELETE without a session is rejected');

  const deleteBadSession = await send('DELETE', { Origin: ALLOWED, 'X-Admin-Request': '1', Cookie: 'ast_admin=short' }, undefined, DELETE_PATH);
  assert.equal(deleteBadSession.status, 401, 'a DELETE with a malformed session token is rejected before any lookup');

  const deleteHostile = await send('DELETE', { Origin: 'https://evil.example', 'X-Admin-Request': '1' }, undefined, DELETE_PATH);
  assert.equal(deleteHostile.headers['access-control-allow-origin'], undefined, 'a hostile origin is not echoed on DELETE');

  console.log('All CORS tests passed.');
} finally {
  server.close();
}
