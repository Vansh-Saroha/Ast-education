// Run with: npm test. Checks upload validation, progress and status transitions, and plain-language errors.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAX_UPLOAD_BYTES, messageForStatus, percentOf, reduce, validateFile, type UploadState } from '../src/lib/uploadState.js';

// 1. Validation before sending
assert.equal(validateFile({ type: 'image/png', size: 1000 }), null, 'png accepted');
assert.equal(validateFile({ type: 'image/jpeg', size: 1000 }), null, 'jpeg accepted');
assert.equal(validateFile({ type: 'image/webp', size: 1000 }), null, 'webp accepted');
assert.match(validateFile({ type: 'image/gif', size: 1000 }) ?? '', /JPEG, PNG or WebP/, 'gif refused');
assert.match(validateFile({ type: 'image/svg+xml', size: 1000 }) ?? '', /JPEG, PNG or WebP/, 'svg refused');
assert.match(validateFile({ type: 'image/png', size: 0 }) ?? '', /empty/, 'empty file refused');
assert.match(validateFile({ type: 'image/png', size: MAX_UPLOAD_BYTES + 1 }) ?? '', /larger than 6 MB/, 'oversize refused');
assert.equal(validateFile({ type: 'image/png', size: MAX_UPLOAD_BYTES }), null, 'exactly the limit is accepted');

// 2. Progress arithmetic stays within 0 to 100
assert.equal(percentOf(0, 100), 0);
assert.equal(percentOf(50, 100), 50);
assert.equal(percentOf(150, 100), 100, 'never above 100');
assert.equal(percentOf(10, 0), 0, 'unknown total shows zero');
assert.equal(percentOf(-5, 100), 0, 'never below zero');

// 3. The happy path: start, progress, sent, processing, done
let s: UploadState = { phase: 'idle' };
s = reduce(s, { type: 'start' });
assert.deepEqual(s, { phase: 'uploading', percent: 0 });
s = reduce(s, { type: 'progress', loaded: 50, total: 100 });
assert.deepEqual(s, { phase: 'uploading', percent: 50 });
s = reduce(s, { type: 'sent' });
assert.deepEqual(s, { phase: 'processing' }, 'bytes sent means the server is processing');
s = reduce(s, { type: 'done', assetId: 'abc', name: 'classroom.jpg' });
assert.deepEqual(s, { phase: 'success', assetId: 'abc', name: 'classroom.jpg' });

// 4. Events that arrive out of order are ignored
assert.deepEqual(reduce({ phase: 'idle' }, { type: 'done', assetId: 'x', name: 'x' }), { phase: 'idle' }, 'done while idle ignored');
assert.deepEqual(reduce({ phase: 'idle' }, { type: 'sent' }), { phase: 'idle' }, 'sent while idle ignored');
assert.deepEqual(reduce({ phase: 'processing' }, { type: 'progress', loaded: 10, total: 100 }), { phase: 'processing' }, 'progress after sending ignored');

// 5. Failures show a message from any state, and reset clears them
assert.deepEqual(reduce({ phase: 'processing' }, { type: 'fail', message: 'Could not read the image.' }), { phase: 'error', message: 'Could not read the image.' });
assert.deepEqual(reduce({ phase: 'error', message: 'x' }, { type: 'reset' }), { phase: 'idle' });

// 6. Server status codes map to plain-language guidance
assert.match(messageForStatus(413), /6 MB/);
assert.match(messageForStatus(415), /JPEG, PNG or WebP/);
assert.match(messageForStatus(422), /could not be used/);
assert.match(messageForStatus(401), /Sign in again/);
assert.match(messageForStatus(429), /Too many uploads/);
assert.match(messageForStatus(500), /failed/);

// 7. The admin preview does not assume a 480 px variant exists. Small sources have no such variant (static check).
const uploader = readFileSync(new URL('../src/admin/ImageUploader.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(uploader, /\/480`/, 'no hard-coded 480 px preview');
assert.match(uploader, /\/preview`/, 'the preview asks the server for the closest available variant');

console.log('All upload tests passed.');
