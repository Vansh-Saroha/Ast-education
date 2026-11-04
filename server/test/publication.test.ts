// Run with: npm test. Needs no database: every rule under test is a pure function or reads files.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { APPROVED_FACTS, APPROVED_LEADERSHIP } from '../src/data/approvedContent.js';
import { buildFactUpdate, buildReviewUpdate } from '../src/routes/adminContent.js';
import { isGalleryItemPublic, isPortraitPublic } from '../src/visibility.js';
import { releasedImage } from '../src/media/reconcile.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const snapshot = JSON.parse(readFileSync(join(repoRoot, 'client/src/seo/verified-facts.json'), 'utf8')) as Record<string, { value: string }> & { snapshotDate?: string };

// 1. Address: one value everywhere, owner-confirmed, with the road name DAV Inter College Road
const address = APPROVED_FACTS.find((f) => f.key === 'address');
assert.ok(address, 'address fact exists');
assert.equal(address.verification, 'verified');
assert.equal(address.verificationSource, 'owner-confirmed', 'owner-confirmed, not document-checked');
assert.equal(address.value, snapshot.address.value, 'seed and client snapshot hold the same address');
assert.equal(address.value, '244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667');
assert.match(address.note, /Not checked against an independent document/, 'note must not claim document verification');

// 2. The snapshot holds only verified facts, and each matches its seed value
const verifiedKeys = APPROVED_FACTS.filter((f) => f.verification === 'verified').map((f) => f.key).sort();
assert.deepEqual(Object.keys(snapshot).filter((k) => k !== 'snapshotDate').sort(), verifiedKeys, 'snapshot = verified facts only');
for (const f of APPROVED_FACTS.filter((x) => x.verification === 'verified')) {
  assert.equal(snapshot[f.key].value, f.value, `snapshot value matches seed for ${f.key}`);
}
assert.ok(!('hours' in snapshot) && !('googleRating' in snapshot), 'pending facts are not in the snapshot');
assert.ok(snapshot.snapshotDate && !Number.isNaN(Date.parse(snapshot.snapshotDate)), 'snapshot is dated');

// 3. The withdrawn road-name wording appears nowhere in the project (assembled at runtime so this file does not hold it)
const forbidden = 'KL' + 'DAV';
const SKIP = new Set(['node_modules', 'dist', 'dist-ssr', '.git', 'var']);
const offenders: string[] = [];
const scan = (dir: string) => {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) scan(full);
    else if (/\.(ts|tsx|js|mjs|json|md|html|py|css)$/.test(name) && name !== 'publication.test.ts') {
      if (readFileSync(full, 'utf8').includes(forbidden)) offenders.push(relative(repoRoot, full));
    }
  }
};
scan(repoRoot);
assert.deepEqual(offenders, [], 'the withdrawn road-name wording must not appear anywhere in the project');

// 4. Portrait seed sources are valid file names held outside the public website folder
const NAME = /^[a-z0-9][a-z0-9._-]{0,79}\.(webp|jpg|jpeg|png)$/;
for (const role of APPROVED_LEADERSHIP) {
  assert.match(role.portraitSource, NAME, `${role.profileType} portrait source name is valid`);
  assert.ok(existsSync(join(repoRoot, 'server/private-assets', role.portraitSource)), `${role.portraitSource} is in server/private-assets`);
}
const publicAssets = readdirSync(join(repoRoot, 'client/public/assets'));
assert.ok(!publicAssets.some((f) => /^(director|manager|dir|mgr)/.test(f)), 'portraits are not in the public website folder');

// 5. A portrait is public only when every condition holds: published, verified, permission confirmed, and an image attached
const live = { status: 'published', verification: 'verified', photoPermission: 'confirmed', portraitAssetId: { _id: 'a' } };
assert.equal(isPortraitPublic(live), true, 'fully permitted portrait is public');
assert.equal(isPortraitPublic({ ...live, photoPermission: 'unconfirmed' }), false, 'no permission, no portrait');
assert.equal(isPortraitPublic({ ...live, verification: 'pending' }), false, 'unverified profile hides its portrait');
assert.equal(isPortraitPublic({ ...live, status: 'draft' }), false, 'draft hides its portrait');
assert.equal(isPortraitPublic({ ...live, status: 'archived' }), false, 'archived hides its portrait');
assert.equal(isPortraitPublic({ ...live, portraitAssetId: null }), false, 'no image, no portrait');

// 6. A gallery image is public only when its record is published, verified and permission-confirmed
const gallery = { status: 'published', verification: 'verified', permissionConfirmed: true, imageAssetId: 'x' };
assert.equal(isGalleryItemPublic(gallery), true);
assert.equal(isGalleryItemPublic({ ...gallery, permissionConfirmed: false }), false, 'unpermitted photo stays private');
assert.equal(isGalleryItemPublic({ ...gallery, status: 'archived' }), false, 'archived photo stays private');
assert.equal(isGalleryItemPublic({ ...gallery, imageAssetId: null }), false, 'no image, nothing to show');

// 7. Review rules compare each save with the stored record. The content editor sends every field on every save,
//    so an unchanged save must never count as an edit.
const owner = { role: 'owner' as const, adminId: 'owner-1', isEdit: true };
const staff = { role: 'staff' as const, adminId: 'staff-1', isEdit: true };
const verifiedCourse = { name: 'DCA', category: 'computer', description: 'Approved text', verification: 'verified', status: 'published' };
const portraitId = 'a'.repeat(24);
const confirmedProfile = {
  profileType: 'director', designation: 'Director / Owner', name: 'Name', biography: 'Bio',
  portraitAssetId: portraitId, photoPermission: 'confirmed', verification: 'verified', status: 'published',
};
const unchangedProfileSave = { profileType: 'director', designation: 'Director / Owner', name: 'Name', biography: 'Bio', portraitAssetId: portraitId, photoPermission: 'confirmed', status: 'published' };

// 7a. Unchanged saves
let r = buildReviewUpdate({ name: 'DCA', category: 'computer', description: 'Approved text', status: 'published', displayOrder: 1 }, { ...staff, current: verifiedCourse });
assert.equal(r.ok && r.data.verification, undefined, 'an unchanged save does not reset verification');

r = buildReviewUpdate({ ...unchangedProfileSave }, { ...staff, current: confirmedProfile });
assert.equal(r.ok, true, 'staff saving an unchanged, confirmed profile is not refused');
assert.equal(r.ok && r.data.photoPermission, undefined, 'the unchanged confirmation is left alone');
assert.equal(r.ok && r.data.verification, undefined, 'an unchanged profile keeps its verification');

r = buildReviewUpdate({ name: 'DCA', category: 'computer', description: 'Approved text', verification: 'verified' }, { ...owner, current: verifiedCourse });
assert.equal(r.ok && r.data.verification, undefined, 're-verifying an unchanged verified item is a no-op');

// 7b. Real changes
r = buildReviewUpdate({ name: 'New name' }, { ...staff, current: verifiedCourse });
assert.equal(r.ok && r.data.verification, 'pending', 'a real content edit returns the item to pending');

r = buildReviewUpdate({ biography: 'Edited bio', portraitAssetId: portraitId, photoPermission: 'confirmed' }, { ...staff, current: confirmedProfile });
assert.equal(r.ok && r.data.verification, 'pending', 'a biography change returns the profile to pending');
assert.equal(r.ok && r.data.photoPermission, undefined, 'a biography change alone does not touch the portrait permission');

r = buildReviewUpdate({ status: 'archived' }, { ...staff, current: verifiedCourse });
assert.equal(r.ok && r.data.verification, undefined, 'a status-only change does not reset verification');

// 7c. Verification: owner-only, and staff may only repeat a verified state that has not changed
r = buildReviewUpdate({ verification: 'verified' }, { ...staff, current: { verification: 'pending' } });
assert.equal(r.ok, false, 'staff cannot verify');
r = buildReviewUpdate({ verification: 'verified', name: 'Changed' }, { ...staff, current: verifiedCourse });
assert.equal(r.ok, false, 'staff cannot verify a changed item, even one that was verified');
r = buildReviewUpdate({ verification: 'verified' }, { ...owner, current: { verification: 'pending' } });
assert.equal(r.ok && r.data.verifiedBy, 'owner-1', 'owner verification is recorded');

// 7d. Portrait permission
r = buildReviewUpdate({ photoPermission: 'confirmed' }, { ...staff, current: { photoPermission: 'unconfirmed' } });
assert.equal(r.ok, false, 'staff cannot confirm photo permission');

r = buildReviewUpdate({ photoPermission: 'confirmed' }, { ...owner, current: { photoPermission: 'unconfirmed' } });
assert.equal(r.ok && r.data.photoPermissionConfirmedBy, 'owner-1', 'owner confirmation is recorded');

r = buildReviewUpdate({ portraitAssetId: 'b'.repeat(24) }, { ...staff, current: confirmedProfile });
assert.equal(r.ok && r.data.photoPermission, 'unconfirmed', 'replacing a confirmed portrait resets its permission');
assert.equal(r.ok && r.data.verification, 'pending', 'replacing a portrait also returns the profile to pending');

r = buildReviewUpdate({ portraitAssetId: null }, { ...staff, current: confirmedProfile });
assert.equal(r.ok && r.data.photoPermission, 'unconfirmed', 'removing a portrait resets its permission');

r = buildReviewUpdate({ portraitAssetId: 'b'.repeat(24), photoPermission: 'confirmed' }, { ...staff, current: confirmedProfile });
assert.equal(r.ok, false, 'staff cannot confirm a replacement portrait either');
r = buildReviewUpdate({ portraitAssetId: 'b'.repeat(24), photoPermission: 'confirmed' }, { ...owner, current: confirmedProfile });
assert.equal(r.ok && r.data.photoPermissionConfirmedBy, 'owner-1', 'owner may confirm the replacement in the same save');

r = buildReviewUpdate({ photoPermission: 'unconfirmed' }, { ...owner, current: confirmedProfile });
assert.equal(r.ok && r.data.photoPermissionConfirmedBy, null, 'withdrawing permission clears the record');

r = buildReviewUpdate({ photoPermission: 'unconfirmed' }, { ...owner, current: { photoPermission: 'unconfirmed' } });
assert.equal(r.ok && r.data.photoPermission, undefined, 'an unchanged withdrawal is a no-op');

// 7e. Gallery permission: a replacement photograph always needs fresh confirmation
r = buildReviewUpdate({ imageAssetId: 'c'.repeat(24), permissionConfirmed: true }, { ...staff, current: { imageAssetId: 'd'.repeat(24), permissionConfirmed: true } });
assert.equal(r.ok && r.data.permissionConfirmed, false, 'a replacement photograph is not confirmed, even if the box is still ticked');
r = buildReviewUpdate({ altText: 'Same', permissionConfirmed: true }, { ...staff, current: { altText: 'Same', imageAssetId: 'd'.repeat(24), permissionConfirmed: true } });
assert.equal(r.ok && r.data.permissionConfirmed, true, 'an unchanged photograph keeps its confirmation');

// 7f. Creating a record is not an edit
r = buildReviewUpdate({ category: 'events', portraitAssetId: 'c'.repeat(24) }, { role: 'staff', adminId: 's', isEdit: false });
assert.equal(r.ok && r.data.photoPermission, undefined, 'creating a record does not force a permission value');

// 7g. Replaced images are released only when the reference actually changed
assert.equal(releasedImage('a', 'b'), 'a', 'a replaced image is released');
assert.equal(releasedImage('a', 'a'), null, 'an unchanged image is kept');
assert.equal(releasedImage(null, 'b'), null, 'a new image releases nothing');
assert.equal(releasedImage('a', null), 'a', 'a removed image is released');

// 8. Fact rules: owner-only verification, sources, and unchanged values
r = buildFactUpdate({ verification: 'verified' }, { role: 'staff', adminId: 's' });
assert.equal(r.ok, false, 'staff cannot verify a fact');
r = buildFactUpdate({ verification: 'verified' }, { role: 'owner', adminId: 'o' });
assert.equal(r.ok && r.data.verificationSource, 'owner-confirmed', 'owner verification defaults to owner-confirmed');
r = buildFactUpdate({ value: 'Changed' }, { role: 'staff', adminId: 's', current: { value: 'Original', verification: 'verified' } });
assert.equal(r.ok && r.data.verification, 'pending', 'a changed value returns to pending');
r = buildFactUpdate({ value: 'Same' }, { role: 'staff', adminId: 's', current: { value: 'Same', verification: 'verified' } });
assert.equal(r.ok && Object.keys(r.data).length, 0, 'an unchanged value writes nothing');

// 9. Public media refuses malformed identifiers and widths before touching the database
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
try {
  assert.equal((await fetch(`${base}/api/public/media/not-an-id/480`)).status, 404, 'malformed identifier');
  assert.equal((await fetch(`${base}/api/public/media/64b7f0c2a1b2c3d4e5f60718/1601`)).status, 404, 'width above the maximum');
  assert.equal((await fetch(`${base}/api/public/media/..%2Fsecret/480`)).status, 404, 'traversal attempt');
  console.log('All publication tests passed.');
} finally {
  server.close();
}
