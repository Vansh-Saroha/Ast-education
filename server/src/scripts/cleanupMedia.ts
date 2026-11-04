// Reconciles stored images with the database. Usage:
//   npm run media:cleanup -- --dry-run   reports only (recommended first, and after any restore)
//   npm run media:cleanup                removes what is safe to remove
// Only images older than 24 hours are removed, so an upload in progress is never affected.
// Output contains identifiers and counts only, never storage keys or file paths.
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { variantKey } from '../media/format.js';
import { findOrphanedObjects } from '../media/reconcile.js';
import { deleteAssetIfUnused, findReferences } from '../media/service.js';
import { MissingObjectError, getStorage } from '../media/storage.js';
import { MediaAsset } from '../models/Media.js';

const dryRun = process.argv.includes('--dry-run');
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

await connectDb();
const storage = getStorage();

// 1. Images in the database that no record uses.
const unusedCandidates = await MediaAsset.find({ createdAt: { $lt: cutoff } }).select('_id').lean();
let unusedAssets = 0;
let removedAssets = 0;
for (const candidate of unusedCandidates) {
  const id = String(candidate._id);
  if ((await findReferences(id)).total > 0) continue;
  unusedAssets++;
  if (!dryRun && (await deleteAssetIfUnused(id))) removedAssets++;
}

// 2. Stored files that no database record describes.
const known = new Set((await MediaAsset.find({}).select('storageId').lean()).map((a) => a.storageId));
const orphans = findOrphanedObjects(await storage.listAll(), known, cutoff);
let removedFiles = 0;
if (!dryRun) {
  for (const group of orphans) {
    for (const key of group.keys) {
      await storage.delete(key);
      removedFiles++;
    }
  }
}

// 3. Database images whose stored files are missing. Records still point at them, so they need re-uploading.
const all = await MediaAsset.find({}).select('_id storageId variants').lean();
const missing: string[] = [];
for (const asset of all) {
  let complete = true;
  for (const v of asset.variants) {
    if (typeof v.width !== 'number') continue;
    try {
      const stored = await storage.get(variantKey(asset.storageId, v.width));
      stored.body.destroy();
    } catch (err) {
      if (err instanceof MissingObjectError) {
        complete = false;
        break;
      }
      throw err;
    }
  }
  if (!complete) missing.push(String(asset._id));
}

console.log(`Unused images older than 24 hours: ${unusedAssets}${dryRun ? ' (dry run, nothing removed)' : `, removed ${removedAssets}`}.`);
console.log(`Stored files with no record, older than 24 hours: ${orphans.length} image(s)${dryRun ? ' (dry run, nothing removed)' : `, removed ${removedFiles} file(s)`}.`);
console.log(`Images whose stored files are missing: ${missing.length}${missing.length ? ` (identifiers: ${missing.join(', ')})` : ''}.`);

await mongoose.disconnect();
