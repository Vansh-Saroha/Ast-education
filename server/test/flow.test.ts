// Run with: npm test.
// Integration test of the complete path for source widths 300, 500, 1200 and 2000:
//   real image processing -> real storage keys -> real local storage -> real HTTP responses from the API.
// The only stand-in is the database layer (in-memory models), so the test runs without MongoDB.
// Live database behaviour is covered by the manual checklist in the README.
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

// Set before any application module loads, so storage is created in a temporary folder.
const tempDir = mkdtempSync(join(tmpdir(), 'ast-flow-'));
process.env.MEDIA_STORAGE = 'local';
process.env.MEDIA_LOCAL_DIR = tempDir;

const { Types } = await import('mongoose');
const { createApp } = await import('../src/app.js');
const { createAsset } = await import('../src/media/service.js');
const { getStorage } = await import('../src/media/storage.js');
const { isStorageKey, plannedWidths, variantKey } = await import('../src/media/format.js');
const { GalleryItem, LeadershipProfile, Testimonial } = await import('../src/models/Content.js');
const { MediaAsset } = await import('../src/models/Media.js');

// --- Database stand-ins (the only part not exercised live) ---
const chain = <T>(value: T) => {
  const self = {
    select: () => self,
    sort: () => self,
    populate: () => self,
    skip: () => self,
    limit: () => self,
    lean: async () => value,
  };
  return self;
};
const assets = new Map<string, Record<string, unknown>>();
(MediaAsset as unknown as Record<string, unknown>).create = async (doc: Record<string, unknown>) => {
  const _id = new Types.ObjectId();
  const stored = { ...doc, _id };
  assets.set(String(_id), stored);
  return { ...stored, toObject: () => stored };
};
(MediaAsset as unknown as Record<string, unknown>).findById = (id: string) => chain(assets.get(String(id)) ?? null);

let galleryRows: unknown[] = [];
let galleryReferenced = false;
let portraitReferenced = false;
let testimonialRows: unknown[] = [];
let testimonialReferenced = false;
(GalleryItem as unknown as Record<string, unknown>).find = () => chain(galleryRows);
(GalleryItem as unknown as Record<string, unknown>).exists = async () => (galleryReferenced ? { _id: 'ref' } : null);
(LeadershipProfile as unknown as Record<string, unknown>).exists = async () => (portraitReferenced ? { _id: 'ref' } : null);
(Testimonial as unknown as Record<string, unknown>).find = () => chain(testimonialRows);
(Testimonial as unknown as Record<string, unknown>).exists = async () => (testimonialReferenced ? { _id: 'ref' } : null);

// --- Real HTTP server ---
const server = createApp().listen(0);
await new Promise<void>((resolve) => server.once('listening', () => resolve()));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

const readAll = async (stream: AsyncIterable<unknown>): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.from(c as Buffer));
  return Buffer.concat(chunks);
};

try {
  for (const source of [300, 500, 1200, 2000]) {
    const input = await sharp({ create: { width: source, height: Math.round(source * 0.6), channels: 3, background: '#082B50' } })
      .jpeg({ quality: 90 })
      .toBuffer();
    const asset = await createAsset(input, 'gallery', `source-${source}.jpg`);
    const id = String(asset._id);
    const expected = plannedWidths(source);
    const storage = getStorage();

    // 1. Stored: every planned variant is recorded, stored under its own key, and reads back at its width
    assert.deepEqual((asset.variants as Array<{ width: number }>).map((v) => v.width), expected, `source ${source}: recorded widths`);
    const storedBytes = new Map<number, Buffer>();
    for (const w of expected) {
      const key = variantKey(String(asset.storageId), w);
      assert.equal(isStorageKey(key), true, `source ${source}: ${key} is a valid key`);
      const bytes = await readAll((await storage.get(key)).body);
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `source ${source} width ${w}: stored as WebP`);
      assert.equal((await sharp(bytes).metadata()).width, w, `source ${source}: the stored image is ${w} px wide`);
      assert.ok(w <= source, `source ${source}: width ${w} is never enlarged`);
      storedBytes.set(w, bytes);
    }

    // 2. Addressed: the gallery API lists every stored width without exposing storage details
    galleryRows = [
      {
        _id: new Types.ObjectId(),
        category: 'classrooms',
        caption: 'Test',
        altText: 'Test photograph',
        imageAssetId: { _id: asset._id, width: asset.width, height: asset.height, variants: asset.variants },
      },
    ];
    galleryReferenced = true;
    const listRes = await fetch(`${base}/api/public/gallery`);
    assert.equal(listRes.status, 200);
    const listText = await listRes.text();
    assert.ok(!listText.includes(String(asset.storageId)), 'the storage identifier never appears in public responses');
    // Public addresses legitimately contain "media/". What must never appear is a storage key: media/{id}/{width}.webp
    assert.ok(!/media\/[a-f0-9]{32}\/[0-9]+\.webp/.test(listText), 'no storage key appears in public responses');
    const item = JSON.parse(listText).items[0];
    assert.equal(item.src, `/api/public/media/${id}/${expected[expected.length - 1]}`, `source ${source}: src is the largest variant`);
    assert.equal(
      item.srcSet,
      expected.map((w) => `/api/public/media/${id}/${w} ${w}w`).join(', '),
      `source ${source}: srcSet lists every stored variant`,
    );

    // 3. Served: each address returns the stored bytes, as WebP, with the gallery cache policy
    for (const w of expected) {
      const res = await fetch(`${base}/api/public/media/${id}/${w}`);
      assert.equal(res.status, 200, `source ${source}: width ${w} is served`);
      assert.equal(res.headers.get('content-type'), 'image/webp');
      assert.equal(res.headers.get('cache-control'), 'private, no-store');
      assert.ok(Buffer.from(await res.arrayBuffer()).equals(storedBytes.get(w)!), `source ${source}: width ${w} serves the stored bytes`);
    }

    // 4. Not addressable: widths that were not stored, and malformed widths
    const notStored = [1, 2, 3, 4, 5, 7, 11, 13, 17, 301, 499, 501, 1199, 1201, 1599].filter((w) => !expected.includes(w));
    for (const w of notStored) {
      assert.equal((await fetch(`${base}/api/public/media/${id}/${w}`)).status, 404, `source ${source}: unstored width ${w} is not served`);
    }
    for (const raw of ['0', '-1', '01', '12.5', '1e3', '1601', 'abc']) {
      assert.equal((await fetch(`${base}/api/public/media/${id}/${raw}`)).status, 404, `source ${source}: malformed width ${raw} is refused`);
    }
  }

  // 5. Visibility: a portrait is never cached, and an image no record uses is never served
  const portrait = await createAsset(await sharp({ create: { width: 500, height: 500, channels: 3, background: '#F26A21' } }).png().toBuffer(), 'portrait', 'p.png');
  const pid = String(portrait._id);
  portraitReferenced = true;
  galleryReferenced = false;
  const permitted = await fetch(`${base}/api/public/media/${pid}/480`);
  assert.equal(permitted.status, 200, 'a permitted portrait is served');
  assert.equal(permitted.headers.get('cache-control'), 'private, no-store', 'a portrait is never cached publicly');
  portraitReferenced = false;
  assert.equal((await fetch(`${base}/api/public/media/${pid}/480`)).status, 404, 'a portrait without permission is not served');
  const unused = await createAsset(await sharp({ create: { width: 300, height: 300, channels: 3, background: '#000000' } }).jpeg().toBuffer(), 'gallery', 'u.jpg');
  assert.equal((await fetch(`${base}/api/public/media/${String(unused._id)}/300`)).status, 404, 'an unused image is not served');

  // 6. Testimonial photos use the actual available variant, including sources smaller than 480px.
  const studentPhoto = await createAsset(await sharp({ create: { width: 300, height: 200, channels: 3, background: '#082B50' } }).png().toBuffer(), 'testimonial', 'student.png');
  const studentPhotoId = String(studentPhoto._id);
  testimonialReferenced = true;
  testimonialRows = [{
    _id: new Types.ObjectId(),
    studentName: 'Test Student',
    courseName: 'Computer Education',
    review: 'A genuine student experience.',
    feedback: 'A genuine student experience.',
    rating: 5,
    photoAssetId: { _id: studentPhoto._id, width: studentPhoto.width, height: studentPhoto.height, variants: studentPhoto.variants },
  }];
  const testimonialRes = await fetch(`${base}/api/public/testimonials`);
  assert.equal(testimonialRes.status, 200);
  const testimonial = (await testimonialRes.json() as { items: Array<{ photo: { src: string; srcSet: string } }> }).items[0];
  assert.equal(testimonial.photo.src, `/api/public/media/${studentPhotoId}/300`, 'a testimonial uses its actual stored source width');
  assert.equal(testimonial.photo.srcSet, `/api/public/media/${studentPhotoId}/300 300w`);
  const studentImageRes = await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}${testimonial.photo.src}`);
  assert.equal(studentImageRes.status, 200, 'a referenced testimonial photo is publicly delivered');
  assert.equal(studentImageRes.headers.get('content-type'), 'image/webp');
  assert.equal(studentImageRes.headers.get('cache-control'), 'private, no-store');
  const expectedStudentBytes = await readAll((await getStorage().get(variantKey(String(studentPhoto.storageId), 300))).body);
  assert.ok(Buffer.from(await studentImageRes.arrayBuffer()).equals(expectedStudentBytes), 'testimonial photo returns the stored variant');
  testimonialReferenced = false;
  assert.equal((await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}${testimonial.photo.src}`)).status, 404, 'unapproved testimonial photos remain private');

  console.log('All processing-to-delivery flow tests passed.');
} finally {
  server.close();
  rmSync(tempDir, { recursive: true, force: true });
}
