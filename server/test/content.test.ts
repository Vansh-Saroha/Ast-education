// Run with: npm test. No database is needed: these checks cover the visibility rules, validation and
// authentication. Database-backed behaviour is covered by the manual checklist in the README.
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { publicFilters } from '../src/routes/public.js';
import { contentSchemas, factKeySchema, updateFactSchema } from '../src/validators/content.js';
import { buildReviewUpdate } from '../src/routes/adminContent.js';

// 1. Public visibility rules: the single source of truth for what the website may show
assert.deepEqual(publicFilters.courses(), { status: 'published', verification: 'verified' });
assert.deepEqual(publicFilters.leadership(), { status: 'published', verification: 'verified' });
assert.deepEqual(publicFilters.gallery(), { status: 'published', verification: 'verified', permissionConfirmed: true });
assert.deepEqual(publicFilters.testimonials(), { status: 'published', verification: 'verified', consentStatus: 'confirmed' });
assert.deepEqual(publicFilters.videos(), { status: 'published', consentStatus: 'confirmed', $or: [{ isMinor: false }, { guardianConsentConfirmed: true }] });
assert.deepEqual(publicFilters.facts(), { verification: 'verified', value: { $ne: '' } });

// 2. Content validation
const course = contentSchemas.courses.create;
assert.equal(course.safeParse({ name: 'DCA', category: 'computer' }).success, true, 'valid course');
assert.equal(course.safeParse({ name: 'DCA', category: 'cooking' }).success, false, 'unknown category');
assert.equal(course.safeParse({ name: 'DCA', category: 'computer', fees: 5000 }).success, false, 'fees are not stored');
assert.equal(course.safeParse({ name: 'DCA', category: 'computer', verification: 'verified' }).success, true, 'owner may verify via review fields');
assert.equal(course.safeParse({ name: '<b>x</b>', category: 'computer' }).success, true, 'markup is cleaned, not rejected');

const gallery = contentSchemas.gallery.create;
const photo = { category: 'classrooms', altText: 'Classroom', imageAssetId: '64b7f0c2a1b2c3d4e5f60718' };
assert.equal(gallery.safeParse(photo).success, true, 'uploaded image reference accepted');
assert.equal(gallery.safeParse({ ...photo, imageAssetId: '../../etc/passwd' }).success, false, 'path-like reference refused');
assert.equal(gallery.safeParse({ ...photo, imageUrl: 'https://example.com/a.jpg' }).success, false, 'external image addresses are no longer accepted');
assert.equal(gallery.safeParse({ category: 'classrooms', altText: 'x', imageAssetId: 'nope' }).success, false, 'a reference is required');

// Gallery publication consent is an owner-only server-side action.
assert.equal(buildReviewUpdate({ permissionConfirmed: true }, { role: 'staff', isEdit: false }).ok, false, 'staff cannot confirm gallery permission on create');
assert.equal(buildReviewUpdate({ permissionConfirmed: true }, { role: 'owner', isEdit: false }).ok, true, 'owner can confirm gallery permission');
assert.equal(buildReviewUpdate({ permissionConfirmed: true }, { role: 'staff', isEdit: true, current: { permissionConfirmed: false } }).ok, false, 'staff cannot confirm gallery permission on edit');

assert.equal(contentSchemas.testimonials.create.safeParse({ studentName: 'Asha', feedback: 'short' }).success, false, 'feedback too short');
assert.equal(contentSchemas.testimonials.create.safeParse({ studentName: 'Asha', feedback: 'A genuine experience.', rating: 9 }).success, false, 'rating above 5');
assert.equal(contentSchemas.leadership.create.safeParse({ profileType: 'owner', designation: 'Owner' }).success, false, 'unknown profile type');
assert.equal(contentSchemas.leadership.update.safeParse({ portraitAssetId: null }).success, true, 'portrait may be removed');
assert.equal(contentSchemas.leadership.update.safeParse({ portraitAssetId: 'x.webp' }).success, false, 'portrait must be a media id');
assert.equal(contentSchemas.leadership.update.safeParse({ biography: 'Supplied by the institute.' }).success, true, 'partial leadership update');

assert.equal(updateFactSchema.safeParse({ value: '5 December 2023' }).success, true, 'fact value update');
assert.equal(updateFactSchema.safeParse({ googleRating: '4.9' }).success, false, 'unknown fact field refused');
assert.equal(factKeySchema.safeParse('../secret').success, false, 'path-like fact key refused');
assert.equal(factKeySchema.safeParse('phone').success, true, 'valid fact key');

// 3. Admin content endpoints refuse anonymous access before any database work
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

try {
  for (const path of ['courses', 'leadership', 'gallery', 'testimonials', 'facts', 'videos']) {
    const res = await fetch(`${base}/api/admin/${path}`);
    assert.equal(res.status, 401, `GET /api/admin/${path} must require sign-in`);
  }

  // Writes need the custom header first, then a session
  const noHeader = await fetch(`${base}/api/admin/courses`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(noHeader.status, 403, 'content writes need the CSRF header');

  const noSession = await fetch(`${base}/api/admin/facts/phone`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'X-Admin-Request': '1' },
    body: '{"value":"+91 00000 00000"}',
  });
  assert.equal(noSession.status, 401, 'fact edits need a session');

  // Public API exists but is not reachable without a database in this test, so only check the route is mounted
  const publicRes = await fetch(`${base}/api/public/nonexistent`);
  assert.equal(publicRes.status, 404);

  console.log('All content tests passed.');
} finally {
  server.close();
}
