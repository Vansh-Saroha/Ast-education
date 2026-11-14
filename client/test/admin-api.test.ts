// Run with: npm test. Verifies cookie credentials and stale session-check handling.
import assert from 'node:assert/strict';
import { adminApi } from '../src/admin/api';

const admin = { id: 'admin-1', email: 'owner@example.test', name: 'Owner', role: 'owner' as const };
const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const originalFetch = globalThis.fetch;

try {
  const requests: RequestInit[] = [];
  globalThis.fetch = async (_input, init) => {
    requests.push(init ?? {});
    return jsonResponse({ admin });
  };

  await Promise.all([adminApi.me(), adminApi.me()]);
  await adminApi.login(admin.email, 'test-password');
  await adminApi.logout();
  assert.equal(requests.length, 3, 'concurrent session checks share one request');
  assert.ok(requests.every((init) => init.credentials === 'include'), 'all admin API calls include session cookies');

  let resolveFirstMe!: (response: Response) => void;
  let callCount = 0;
  globalThis.fetch = async (input, init) => {
    callCount += 1;
    assert.equal(init?.credentials, 'include', 'session checks include cookies');
    if (String(input).endsWith('/auth/me') && callCount === 1) {
      return new Promise<Response>((resolve) => {
        resolveFirstMe = resolve;
      });
    }
    return jsonResponse({ admin });
  };

  const inFlightCheck = adminApi.me();
  await adminApi.login(admin.email, 'test-password');
  resolveFirstMe(jsonResponse({ error: { message: 'Please sign in.' } }, 401));
  assert.equal((await inFlightCheck).admin.id, admin.id, 'a stale 401 is retried after a new login');
  assert.equal(callCount, 3, 'the stale check retries once using the new session');

  console.log('All admin API tests passed.');
} finally {
  globalThis.fetch = originalFetch;
}
