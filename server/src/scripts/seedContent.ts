// Seeds approved content from src/data/approvedContent.ts. Safe to re-run: existing records are never changed.
// Usage: npm run seed:content
// Records created by an earlier seed are not updated. Re-verify such facts in the admin Business facts page.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { APPROVED_COURSES, APPROVED_FACTS, APPROVED_LEADERSHIP } from '../data/approvedContent.js';
import { createAsset } from '../media/service.js';
import { BusinessFact, Course, LeadershipProfile } from '../models/Content.js';
import { MediaAsset } from '../models/Media.js';

// Seed source only. These files are imported into the media store and are never served from here.
const SEED_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../private-assets');

await connectDb();

let courses = 0;
for (const [name, category] of APPROVED_COURSES) {
  const res = await Course.updateOne(
    { name },
    { $setOnInsert: { name, category, status: 'published', verification: 'verified', verifiedAt: new Date(), displayOrder: courses + 1 } },
    { upsert: true },
  );
  if (res.upsertedCount) courses++;
}

let leaders = 0;
let portraits = 0;
for (const role of APPROVED_LEADERSHIP) {
  const res = await LeadershipProfile.updateOne(
    { profileType: role.profileType },
    { $setOnInsert: { profileType: role.profileType, designation: role.designation, status: 'published', verification: 'pending', photoPermission: 'unconfirmed', portraitAssetId: null } },
    { upsert: true },
  );
  if (res.upsertedCount) leaders++;

  const record = await LeadershipProfile.findOne({ profileType: role.profileType }).select('_id portraitAssetId').lean();
  const source = join(SEED_DIR, role.portraitSource);
  if (record && !record.portraitAssetId && existsSync(source)) {
    const asset = await createAsset(readFileSync(source), 'portrait', role.portraitSource);
    // Attach only if the portrait is still missing, so a concurrent edit is never overwritten.
    const attached = await LeadershipProfile.updateOne({ _id: record._id, portraitAssetId: null }, { $set: { portraitAssetId: asset._id } });
    if (attached.modifiedCount) portraits++;
    else await MediaAsset.deleteOne({ _id: asset._id });
  }
}

let facts = 0;
for (const f of APPROVED_FACTS) {
  const verified = f.verification === 'verified';
  const res = await BusinessFact.updateOne(
    { key: f.key },
    {
      $setOnInsert: {
        key: f.key,
        label: f.label,
        value: f.value,
        note: f.note,
        verification: f.verification,
        verificationSource: f.verificationSource,
        verifiedAt: verified ? new Date() : null,
      },
    },
    { upsert: true },
  );
  if (res.upsertedCount) facts++;
}

console.log(
  `Seeded ${courses} courses, ${leaders} leadership records, ${portraits} portrait image(s) and ${facts} business facts (existing records untouched).`,
);
await mongoose.disconnect();
