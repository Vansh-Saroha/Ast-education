// Run with: npm test. Exercises the real image library on generated images. Needs no database.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { ACCEPTED_TYPES, assertSafeKey, detectFormat, isStorageKey, parsePurpose, parseWidth, purposeError, sanitizeDisplayName, variantKey } from '../src/media/format.js';
import { findOrphanedObjects } from '../src/media/reconcile.js';
import { publicMediaCacheControl } from '../src/visibility.js';
import { MediaError, processImage } from '../src/media/pipeline.js';
import { LocalStorage, MissingObjectError } from '../src/media/storage.js';

const blob = (w: number, h: number, colour: string) => sharp({ create: { width: w, height: h, channels: 3, background: colour } });
const jpeg = await blob(2000, 1000, '#F26A21').jpeg().toBuffer();
const png = await blob(300, 200, '#082B50').png().toBuffer();
const webp = await blob(800, 600, '#F4B928').webp().toBuffer();

// 1. Content detection: the real format wins over the declared type and the file name
assert.equal(detectFormat(jpeg), 'jpeg');
assert.equal(detectFormat(png), 'png');
assert.equal(detectFormat(webp), 'webp');
assert.equal(detectFormat(Buffer.from('GIF89a' + '\0'.repeat(20))), null, 'GIF refused');
assert.equal(detectFormat(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), null, 'SVG refused');
assert.equal(detectFormat(Buffer.from('<html><script>x</script></html>')), null, 'HTML refused');
assert.equal(detectFormat(Buffer.from('MZ\x90\0' + '\0'.repeat(30))), null, 'executable refused');
assert.equal(detectFormat(png.subarray(0, 4)), null, 'truncated header refused');
assert.deepEqual([...ACCEPTED_TYPES], ['image/jpeg', 'image/png', 'image/webp'], 'only three types are accepted');

// 2. Display names: plain text only, no paths, markup or control characters
assert.equal(sanitizeDisplayName('../../etc/passwd.jpg'), 'passwd.jpg');
assert.equal(sanitizeDisplayName('%2e%2e%2fsecret%2fclass photo.png'), 'class photo.png');
assert.equal(sanitizeDisplayName('<img onerror=x>.png').includes('<'), false, 'markup removed');
assert.equal(sanitizeDisplayName('a\u0000b\u0007c.jpg'), 'abc.jpg', 'control characters removed');
assert.equal(sanitizeDisplayName(undefined), 'image');
assert.equal(sanitizeDisplayName('%E0%A4%A'), 'image', 'malformed encoding falls back safely');
assert.ok(sanitizeDisplayName('x'.repeat(400)).length <= 120, 'names are capped');

// 3. Storage keys: built from random identifiers only, and anything else is refused
const id = 'a'.repeat(32);
assert.equal(variantKey(id, 960), `media/${id}/960.webp`);
assertSafeKey(variantKey(id, 480));
for (const bad of ['../x', `media/${id}/../960.webp`, `media/${id.toUpperCase()}/480.webp`, `media/${id}/1601.webp`, `media/${id}/0.webp`, `/etc/passwd`, `media/${id}/480.webp/../../x`]) {
  assert.throws(() => assertSafeKey(bad), /Unsafe storage key/, `refuses ${bad}`);
}
assert.equal(parseWidth('960'), 960);
assert.equal(parseWidth('1601'), null, 'widths above the maximum are refused');
assert.equal(parsePurpose('gallery'), 'gallery');
assert.equal(parsePurpose('avatar'), null);
assert.equal(purposeError('portrait', 'gallery') !== null, true, 'a portrait cannot be used as a gallery photo');
assert.equal(purposeError('gallery', 'gallery'), null);

// 4. Optimisation: responsive WebP variants, never enlarged, and no metadata left behind
const big = await processImage(jpeg);
assert.equal(big.format, 'jpeg');
assert.deepEqual(big.variants.map((v) => v.width), [480, 960, 1600], 'responsive widths');
assert.equal(big.width, 1600);
assert.equal(big.variants[0].data.subarray(0, 4).toString('ascii'), 'RIFF', 'output is WebP');
assert.equal(big.variants[0].data.subarray(8, 12).toString('ascii'), 'WEBP');

const small = await processImage(png);
assert.deepEqual(small.variants.map((v) => v.width), [300], 'small images are not enlarged');
assert.equal(small.width, 300);

const withExif = await blob(640, 480, '#082B50').jpeg().withExif({ IFD0: { Copyright: 'Private camera owner' } }).toBuffer();
const cleaned = await processImage(withExif);
const outputMeta = await sharp(cleaned.variants[0].data).metadata();
assert.equal(outputMeta.exif, undefined, 'EXIF metadata is removed from published images');

// 5. Refusals: content that is not a permitted image, decompression-style abuse, and damaged files
const expectRejection = async (input: Buffer, label: string) => {
  await assert.rejects(processImage(input), (err: unknown) => err instanceof MediaError && err.status === 422, label);
};
await expectRejection(Buffer.from('plain text pretending to be a picture'), 'plain text');
await expectRejection(Buffer.from('GIF89a' + '\0'.repeat(40)), 'GIF');
await expectRejection(await blob(8100, 50, '#000000').png().toBuffer(), 'dimensions above the limit');
await expectRejection(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('damaged data'.repeat(20))]), 'damaged JPEG');

// 6. Local storage: round trip, overwrite protection, and missing objects
const dir = mkdtempSync(join(tmpdir(), 'ast-media-'));
try {
  const storage = new LocalStorage(dir);
  const key = variantKey(id, 480);
  await storage.put(key, Buffer.from('bytes'), 'image/webp');
  const stored = await storage.get(key);
  const chunks: Buffer[] = [];
  for await (const c of stored.body) chunks.push(Buffer.from(c));
  assert.equal(Buffer.concat(chunks).toString(), 'bytes', 'stored bytes read back');
  await assert.rejects(storage.put(key, Buffer.from('again'), 'image/webp'), 'existing objects are never overwritten');
  await storage.delete(key);
  await assert.rejects(storage.get(key), MissingObjectError, 'deleted objects are gone');
  await assert.rejects(storage.put('../escape.webp', Buffer.from('x'), 'image/webp'), /Unsafe storage key/, 'traversal refused by storage');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// 6b. Cache policy: a withdrawn portrait must never be served from a cache
assert.equal(publicMediaCacheControl('portrait'), 'private, no-store', 'portraits are never cached publicly');
assert.equal(publicMediaCacheControl('gallery'), 'private, no-store', 'gallery photos are not cached after permission withdrawal');
const routeSource = readFileSync(new URL('../src/routes/public.ts', import.meta.url), 'utf8');
assert.match(routeSource, /publicMediaCacheControl\(asset\.purpose\)/, 'the public media route uses the purpose-based policy');
assert.doesNotMatch(routeSource, /max-age=86400/, 'the long public cache for images is gone');
// Static checks: these two guards query the database, so no suite here runs them live. These checks fail if either is removed.
assert.match(routeSource, /if \(!\(await isAssetPubliclyUsed\(String\(asset\._id\)\)\)\) \{/, 'public image delivery checks that a permitted record uses the image (static check)');
const mediaRouteSource = readFileSync(new URL('../src/routes/media.ts', import.meta.url), 'utf8');
assert.match(mediaRouteSource, /if \(refs\.total > 0\) \{/, 'deletion is refused while a record still uses the image (static check)');
const mediaServiceSource = readFileSync(new URL('../src/media/service.ts', import.meta.url), 'utf8');
assert.match(mediaServiceSource, /Testimonial\.exists\(\{\s*photoAssetId: assetId,\s*status: 'approved',\s*consent: true,\s*\}\)/, 'approved, consented testimonial photos are publicly deliverable');
assert.match(mediaServiceSource, /Testimonial\.countDocuments\(\{ photoAssetId: assetId \}\)/, 'testimonial photos are retained while referenced');
assert.match(mediaRouteSource, /refs\.testimonials \? 'a testimonial' : ''/, 'asset deletion reports testimonial references');

// 6c. Orphan detection: only files this application writes are considered, and only when old and unreferenced
assert.equal(isStorageKey(variantKey('e'.repeat(32), 480)), true);
assert.equal(isStorageKey('media/' + 'e'.repeat(32) + '/notes.txt'), false, 'other files are not storage keys');
const orphanDir = mkdtempSync(join(tmpdir(), 'ast-orphan-'));
try {
  const store = new LocalStorage(orphanDir);
  const keptId = 'f'.repeat(32);
  const orphanId = '0'.repeat(32);
  await store.put(variantKey(keptId, 480), Buffer.from('kept'), 'image/webp');
  await store.put(variantKey(orphanId, 480), Buffer.from('o1'), 'image/webp');
  await store.put(variantKey(orphanId, 960), Buffer.from('o2'), 'image/webp');
  writeFileSync(join(orphanDir, 'media', orphanId, 'notes.txt'), 'not ours');
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  for (const f of ['480.webp', '960.webp', 'notes.txt']) await utimes(join(orphanDir, 'media', orphanId, f), threeDaysAgo, threeDaysAgo);
  await utimes(join(orphanDir, 'media', keptId, '480.webp'), threeDaysAgo, threeDaysAgo);

  const listed = await store.listAll();
  assert.equal(listed.some((o) => o.key.endsWith('notes.txt')), false, 'unknown files are never listed');
  assert.equal(listed.length, 3, 'three application files are listed');

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const groups = findOrphanedObjects(listed, new Set([keptId]), dayAgo);
  assert.equal(groups.length, 1, 'exactly one orphaned image');
  assert.equal(groups[0].storageId, orphanId);
  assert.equal(groups[0].keys.length, 2, 'both variants of the orphan are found');

  const tooRecent = findOrphanedObjects(listed, new Set([keptId]), new Date(Date.now() - 4 * 24 * 60 * 60 * 1000));
  assert.equal(tooRecent.length, 0, 'files newer than the cutoff are kept, so an upload in progress is safe');
} finally {
  rmSync(orphanDir, { recursive: true, force: true });
}

// 7. HTTP: uploads, previews and deletion require a session, and public media stays closed without one
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
try {
  const upload = (headers: Record<string, string>) =>
    fetch(`${base}/api/admin/media?purpose=gallery`, { method: 'POST', headers: { 'content-type': 'image/png', ...headers }, body: png });
  assert.equal((await upload({ 'X-Admin-Request': '1' })).status, 401, 'upload needs a session');
  assert.equal((await upload({})).status, 403, 'upload needs the custom header');
  assert.equal((await fetch(`${base}/api/admin/media/${'a'.repeat(24)}/480`)).status, 401, 'admin preview needs a session');
  assert.equal((await fetch(`${base}/api/admin/media/${'a'.repeat(24)}`, { method: 'DELETE', headers: { 'X-Admin-Request': '1' } })).status, 401, 'deletion needs a session');
  console.log('All media tests passed.');
} finally {
  server.close();
}
