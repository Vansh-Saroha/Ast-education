// Run with: npm test. Checks how loading, live and approved-fallback data are distinguished.
import assert from 'node:assert/strict';
import { loadingWith, resolveFacts, settle } from '../src/lib/dataState.js';

const SEED = [{ id: 'DCA', name: 'DCA' }];
const SNAPSHOT = { address: '244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667', phone: '+91 89794 87215' };

// 1. Loading placeholders are never reported as live
assert.equal(loadingWith(SEED).availability, 'loading');

// 2. A live answer is shown exactly, including an empty list. Archived courses never come back from the fallback.
const liveEmpty = settle({ ok: true, items: [] as typeof SEED }, SEED);
assert.equal(liveEmpty.availability, 'live');
assert.equal(liveEmpty.items.length, 0, 'an empty live list must not be replaced by the seed');

const liveOne = settle({ ok: true, items: [{ id: 'Tally', name: 'Tally' }] }, SEED);
assert.deepEqual(liveOne.items.map((i) => i.name), ['Tally'], 'live list replaces the seed');

// 3. An unreachable API keeps the approved fallback, but labelled as fallback
const down = settle({ ok: false }, SEED);
assert.equal(down.availability, 'fallback', 'unreachable data is labelled as fallback');
assert.deepEqual(down.items, SEED);

// 4. Facts: live values replace the snapshot completely, so a hidden fact disappears
const live = resolveFacts({ ok: true, items: [{ key: 'phone', value: '+91 89794 87215' }] }, SNAPSHOT, '2026-11-03');
assert.equal(live.availability, 'live');
assert.equal(live.facts.address, undefined, 'a fact absent from the live answer is not shown from the snapshot');
assert.equal(live.facts.phone, '+91 89794 87215');

// 5. Facts: unreachable API falls back to the approved snapshot, labelled with its date
const fallback = resolveFacts({ ok: false }, SNAPSHOT, '2026-11-03');
assert.equal(fallback.availability, 'fallback');
assert.equal(fallback.facts.address, SNAPSHOT.address);
assert.equal(fallback.snapshotDate, '2026-11-03');

// 6. Hours and ratings are never part of the fallback, even if someone adds them to the snapshot
assert.equal('hours' in fallback.facts, false);

console.log('All client data-state tests passed.');
