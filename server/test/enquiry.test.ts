// Run with: npm test (sets its own limits; no MongoDB needed because these cases never reach the database)
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { enquirySchema } from '../src/validators/enquiry.js';

const valid = {
  studentName: 'Asha Verma',
  mobile: '+91 98765 43210',
  email: '',
  qualification: 'Class 12',
  course: 'DCA',
  message: '',
  consent: true,
  website: '',
  sourcePage: '/enquiry',
};

// 1. Schema: normalises the mobile number and rejects bad input
const parsed = enquirySchema.parse(valid);
assert.equal(parsed.mobile, '9876543210');
assert.equal(enquirySchema.safeParse({ ...valid, consent: false }).success, false, 'consent must be true');
assert.equal(enquirySchema.safeParse({ ...valid, studentName: '<script>x</script>' }).success, false, 'markup in name');
assert.equal(enquirySchema.safeParse({ ...valid, isAdmin: true }).success, false, 'unknown fields rejected');
assert.equal(enquirySchema.safeParse({ ...valid, mobile: '12345' }).success, false, 'short mobile rejected');
assert.equal(enquirySchema.safeParse({ ...valid, course: 'Unlisted course' }).success, false, 'unknown course rejected');

// 2. HTTP: validation, honeypot and rate limiting (ENQUIRY_RATE_LIMIT_MAX=5 set in the test command)
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const post = (body: unknown) =>
  fetch(`${base}/api/enquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

try {
  // Requests 1 and 2: invalid payloads get 400 before any database work
  assert.equal((await post({ ...valid, mobile: '12345' })).status, 400);
  assert.equal((await post({ ...valid, consent: false })).status, 400);

  // Requests 3 to 5: honeypot filled, accepted silently, nothing stored
  for (let i = 0; i < 3; i++) {
    assert.equal((await post({ ...valid, website: 'http://spam.example' })).status, 201);
  }

  // Request 6 in the window: rate limited
  assert.equal((await post({ ...valid, website: 'x' })).status, 429);

  // Unknown API route returns JSON 404
  const notFound = await fetch(`${base}/api/does-not-exist`);
  assert.equal(notFound.status, 404);
  assert.equal((await notFound.json() as { error: { code: string } }).error.code, 'NOT_FOUND');

  console.log('All enquiry tests passed.');
} finally {
  server.close();
}
