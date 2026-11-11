// Run with: npm test. Pure rules for widths, storage keys, previews and addresses. Needs no database.
import assert from 'node:assert/strict';
import { assertSafeKey, isStorageKey, isValidWidth, parseWidth, plannedWidths, variantKey } from '../src/media/format.js';
import { previewWidth, responsiveImage, variantUrl } from '../src/media/delivery.js';

const ID = 'a'.repeat(32);

// 1. Planned widths: never above the source, never above 1600, always whole and ascending
assert.deepEqual(plannedWidths(300), [300], 'a small source keeps its own width only');
assert.deepEqual(plannedWidths(500), [480, 500], 'a source between two sizes keeps both');
assert.deepEqual(plannedWidths(1200), [480, 960, 1200], 'the original width is added when it is not a common size');
assert.deepEqual(plannedWidths(2000), [480, 960, 1600], 'large sources are capped at 1600');
assert.deepEqual(plannedWidths(1600), [480, 960, 1600], 'exactly 1600 stays 1600');
assert.deepEqual(plannedWidths(1), [1], 'a one-pixel source is valid');
assert.deepEqual(plannedWidths(6000), [480, 960, 1600], 'very large sources are still capped');
assert.deepEqual(plannedWidths(0), [], 'zero produces nothing');
assert.deepEqual(plannedWidths(-5), [], 'negative produces nothing');
assert.deepEqual(plannedWidths(12.5), [], 'decimal sources produce nothing');
for (const source of [1, 37, 300, 479, 480, 481, 500, 959, 960, 961, 1199, 1200, 1599, 1600, 2000, 5999, 6000]) {
  const widths = plannedWidths(source);
  assert.ok(widths.length >= 1, `source ${source} yields at least one variant`);
  for (const w of widths) {
    assert.ok(w <= source, `source ${source}: variant ${w} is never enlarged`);
    assert.ok(isValidWidth(w), `source ${source}: variant ${w} is a valid width`);
  }
  assert.deepEqual(widths, [...widths].sort((a, b) => a - b), `source ${source}: ascending`);
  assert.equal(new Set(widths).size, widths.length, `source ${source}: no duplicates`);
}

// 2. Keys: exactly media/{storageId}/{width}.webp, with a strict identifier and a bounded width
assert.equal(variantKey(ID, 500), `media/${ID}/500.webp`);
assert.equal(variantKey(ID, 1), `media/${ID}/1.webp`);
assert.equal(variantKey(ID, 1600), `media/${ID}/1600.webp`);
for (const width of [1, 2, 299, 300, 479, 500, 999, 1000, 1199, 1200, 1600]) {
  assert.equal(isStorageKey(`media/${ID}/${width}.webp`), true, `width ${width} is storable`);
  assertSafeKey(`media/${ID}/${width}.webp`);
}
for (const width of [0, -1, 1601, 12.5, NaN, Infinity]) {
  assert.throws(() => variantKey(ID, width), /Invalid variant identity/, `variantKey refuses ${width}`);
  assert.equal(isStorageKey(`media/${ID}/${width}.webp`), false, `isStorageKey refuses ${width}`);
}
for (const badId of ['', 'A'.repeat(32), 'a'.repeat(31), 'a'.repeat(33), 'g'.repeat(32), '../' + 'a'.repeat(29)]) {
  assert.throws(() => variantKey(badId, 480), /Invalid variant identity/, `identifier ${JSON.stringify(badId)} refused`);
}
for (const key of [
  `media/${ID}/0480.webp`, `media/${ID}/480.jpg`, `media/${ID}/480.webp.exe`, `media/${ID}/-300.webp`,
  `media/${ID}/12.5.webp`, `media/${ID}/1e3.webp`, `media/${ID}/../480.webp`, `/media/${ID}/480.webp`,
  `media/${ID.toUpperCase()}/480.webp`, `media/${ID}/480.webp/../../x`, `media/${ID}/99999.webp`,
]) {
  assert.equal(isStorageKey(key), false, `${key} is not a storage key`);
  assert.throws(() => assertSafeKey(key), /Unsafe storage key/);
}

// 3. Widths in requests: canonical decimal text inside the range, nothing else
assert.equal(parseWidth('1'), 1);
assert.equal(parseWidth('480'), 480);
assert.equal(parseWidth('1600'), 1600);
for (const raw of ['0', '00', '0480', '-1', '+5', '1601', '99999', '12.5', '1e3', ' 480', '480 ', '', 'abc', '480px', '../480', '4 80']) {
  assert.equal(parseWidth(raw), null, `parseWidth refuses ${JSON.stringify(raw)}`);
}

// 4. Previews: the largest variant at or below 480, otherwise the smallest available
assert.equal(previewWidth([300]), 300, 'a small image previews at its only size');
assert.equal(previewWidth([480, 500]), 480);
assert.equal(previewWidth([480, 960, 1200]), 480);
assert.equal(previewWidth([1, 2, 3]), 3, 'the largest that fits under the target is used');
assert.equal(previewWidth([600, 1200]), 600, 'the smallest is used when nothing fits under the target');
assert.equal(previewWidth([]), null);

// 5. Addresses: srcSet lists every stored variant, and src is the largest
const image = responsiveImage(ID, [{ width: 1200 }, { width: 480 }, { width: 960 }], 1200, 800);
assert.ok(image);
assert.equal(image.src, variantUrl(ID, 1200));
assert.equal(image.srcSet, `/api/public/media/${ID}/480 480w, /api/public/media/${ID}/960 960w, /api/public/media/${ID}/1200 1200w`);
const smallImage = responsiveImage(ID, [{ width: 300 }], 300, 200);
assert.ok(smallImage);
assert.equal(smallImage.src, variantUrl(ID, 300), 'small photos use their actual stored width instead of a missing 480px variant');
assert.equal(smallImage.srcSet, `/api/public/media/${ID}/300 300w`);
assert.equal(responsiveImage(ID, [], 1, 1), null, 'no variants, no image');

console.log('All width-rule tests passed.');
