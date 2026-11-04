import { pipeline } from 'node:stream/promises';
import type { Response } from 'express';
import { Types } from 'mongoose';
import { GalleryItem, LeadershipProfile } from '../models/Content.js';
import { MediaAsset, type MediaPurpose } from '../models/Media.js';
import { publicFilters } from '../visibility.js';
import { MissingObjectError, getStorage } from './storage.js';
import { MediaError, processImage } from './pipeline.js';
import { assertSafeKey, newStorageId, purposeError, variantKey } from './format.js';

export interface AssetView {
  id: string;
  purpose: MediaPurpose;
  displayName: string;
  width: number;
  height: number;
  variantWidths: number[];
}

export function assetView(a: { _id: unknown; purpose: string; displayName?: string | null; width: number; height: number; variants: ReadonlyArray<{ width?: number | null }> }): AssetView {
  return {
    id: String(a._id),
    purpose: a.purpose as MediaPurpose,
    displayName: a.displayName ?? 'image',
    width: a.width,
    height: a.height,
    variantWidths: a.variants.map((v) => Number(v.width)),
  };
}

/** Processes, stores and records an uploaded image. Objects are written first; the record is created last. */
export async function createAsset(input: Buffer, purpose: MediaPurpose, displayName: string, uploadedBy?: string) {
  const image = await processImage(input);
  const storageId = newStorageId();
  const storage = getStorage();
  const written: string[] = [];
  try {
    for (const v of image.variants) {
      const key = variantKey(storageId, v.width);
      await storage.put(key, v.data, 'image/webp');
      written.push(key);
    }
    return await MediaAsset.create({
      purpose,
      storageId,
      displayName,
      width: image.width,
      height: image.height,
      bytes: input.length,
      variants: image.variants.map((v) => ({ width: v.width, bytes: v.data.length })),
      uploadedBy: uploadedBy && Types.ObjectId.isValid(uploadedBy) ? uploadedBy : undefined,
    });
  } catch (err) {
    // Roll back partial writes so no orphaned objects remain.
    for (const key of written) await storage.delete(key).catch(() => undefined);
    throw err;
  }
}

/** Counts the records that use an image. Archived and draft records count too, because they still reference it. */
export async function findReferences(assetId: string): Promise<{ galleryItems: number; portraits: number; total: number }> {
  const galleryItems = await GalleryItem.countDocuments({ imageAssetId: assetId });
  const portraits = await LeadershipProfile.countDocuments({ portraitAssetId: assetId });
  return { galleryItems, portraits, total: galleryItems + portraits };
}

/** Deletes an image and all its variants, but only when no record references it. Returns true when deleted. */
export async function deleteAssetIfUnused(assetId: string): Promise<boolean> {
  if (!Types.ObjectId.isValid(assetId)) return false;
  const refs = await findReferences(assetId);
  if (refs.total > 0) return false;
  const asset = await MediaAsset.findById(assetId).select('storageId variants').lean();
  if (!asset) return false;
  const storage = getStorage();
  for (const v of asset.variants) {
    if (typeof v.width === 'number') await storage.delete(variantKey(asset.storageId, v.width));
  }
  await MediaAsset.deleteOne({ _id: asset._id });
  return true;
}

/** True only when a publicly visible record uses this image. Unused, draft, archived and unpermitted images stay private. */
export async function isAssetPubliclyUsed(assetId: string): Promise<boolean> {
  const gallery = await GalleryItem.exists({ imageAssetId: assetId, ...publicFilters.gallery() });
  if (gallery) return true;
  const portrait = await LeadershipProfile.exists({ portraitAssetId: assetId, ...publicFilters.leadership(), photoPermission: 'confirmed' });
  return !!portrait;
}

/** Streams one stored variant to the response. Sends 404 when the object is missing. */
export async function streamVariant(res: Response, storageId: string, width: number, cacheControl: string): Promise<void> {
  const key = variantKey(storageId, width);
  assertSafeKey(key);
  try {
    const stored = await getStorage().get(key);
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (stored.contentLength !== undefined) res.setHeader('Content-Length', String(stored.contentLength));
    await pipeline(stored.body, res);
  } catch (err) {
    if (err instanceof MissingObjectError) {
      if (!res.headersSent) res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found.' } });
      return;
    }
    throw err;
  }
}

export { MediaError, purposeError };
