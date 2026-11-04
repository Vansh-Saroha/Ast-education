import assert from 'node:assert/strict';
import { getYouTubeId, createVideoSchema, updateVideoSchema } from '../src/validators/video.js';
import { publicRouter } from '../src/routes/public.js';

const validId = 'abcdefghijk';
for (const url of [
  `https://www.youtube.com/watch?v=${validId}`,
  `https://youtu.be/${validId}`,
  `https://www.youtube.com/shorts/${validId}`,
  `https://www.youtube.com/embed/${validId}`,
]) assert.equal(getYouTubeId(url), validId, `${url} should parse`);
for (const url of [
  'https://evil.example/watch?v=abcdefghijk',
  'javascript:alert(1)',
  `http://youtube.com/watch?v=${validId}`,
  `https://user@youtube.com/watch?v=${validId}`, 
  'https://youtube.com.evil.example/watch?v=abcdefghijk',
  'https://youtu.be/short',
  'https://youtube.com/watch?v=../../etc/passwd',
]) assert.equal(getYouTubeId(url), null, `${url} should be rejected`);

const base = { youtubeUrl: `https://youtu.be/${validId}`, title: 'Centre tour', category: 'centre-tour' };
assert.equal(createVideoSchema.safeParse(base).success, true, 'valid minimal video');
assert.equal(createVideoSchema.safeParse({ ...base, html: '<script>' }).success, false, 'unknown fields refused');
assert.equal(createVideoSchema.safeParse({ ...base, status: 'published' }).success, true, 'status is schema-valid; route enforces consent');
assert.equal(updateVideoSchema.safeParse({ status: 'published' }).success, true, 'partial update accepted');
assert.equal(updateVideoSchema.safeParse({ iframeUrl: 'https://evil.example' }).success, false, 'arbitrary iframe field refused');

// The route is mounted and the API router owns the publication filtering.
assert.ok(publicRouter, 'public API router exists');
console.log('All video validation tests passed.');
