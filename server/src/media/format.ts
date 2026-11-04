import { randomBytes } from 'node:crypto';

// Everything about image files that does not need the image library: types, names, keys and widths.
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_DIMENSION = 6000;
export const MAX_PIXELS = 24_000_000;

// A stored variant can be any whole width from MIN to MAX. The source width caps it, so images are never enlarged.
export const MIN_VARIANT_WIDTH = 1;
export const MAX_VARIANT_WIDTH = 1600;
// Common responsive sizes. The original width is added as a variant when it is smaller than the largest of these.
export const RESPONSIVE_TARGETS = [480, 960, 1600] as const;

export type ImageFormat = 'jpeg' | 'png' | 'webp';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Identifies the real format from the first bytes. The declared Content-Type is never trusted. */
export function detectFormat(buf: Buffer): ImageFormat | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE)) return 'png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  return null;
}

/** Keeps only a short, plain display name. Paths, markup and control characters are removed. */
export function sanitizeDisplayName(raw: string | undefined): string {
  let name = raw ?? '';
  try {
    name = decodeURIComponent(name);
  } catch {
    name = '';
  }
  name = name.split(/[\\/]/).pop() ?? '';
  name = name.replace(/[\u0000-\u001f\u007f<>"'`]/g, '').replace(/\s+/g, ' ').trim();
  return name.slice(0, 120) || 'image';
}

export const newStorageId = (): string => randomBytes(16).toString('hex');

const STORAGE_ID = /^[a-f0-9]{32}$/;
const KEY_PATTERN = /^media\/([a-f0-9]{32})\/([1-9][0-9]{0,3})\.webp$/;

/** True for whole numbers from MIN_VARIANT_WIDTH to MAX_VARIANT_WIDTH. Nothing else is a valid variant width. */
export const isValidWidth = (n: number): boolean =>
  Number.isSafeInteger(n) && n >= MIN_VARIANT_WIDTH && n <= MAX_VARIANT_WIDTH;

/**
 * The widths to store for a source of the given width, smallest first. Never above the source and never above
 * MAX_VARIANT_WIDTH. Examples: 300 gives [300]; 500 gives [480, 500]; 1200 gives [480, 960, 1200]; 2000 gives [480, 960, 1600].
 */
export function plannedWidths(sourceWidth: number): number[] {
  if (!Number.isSafeInteger(sourceWidth) || sourceWidth < MIN_VARIANT_WIDTH) return [];
  const cap = Math.min(sourceWidth, MAX_VARIANT_WIDTH);
  const widths = new Set<number>([cap]);
  for (const target of RESPONSIVE_TARGETS) if (target < cap) widths.add(target);
  return [...widths].sort((a, b) => a - b);
}

/** Builds the storage key for one variant. Refuses anything that is not a valid storage identifier and width. */
export function variantKey(storageId: string, width: number): string {
  if (!STORAGE_ID.test(storageId) || !isValidWidth(width)) throw new Error('Invalid variant identity');
  return `media/${storageId}/${width}.webp`;
}

/** True only for keys this application writes: media/{32 lowercase hex}/{width 1 to 1600}.webp. */
export function isStorageKey(key: string): boolean {
  const match = KEY_PATTERN.exec(key);
  return !!match && isValidWidth(Number(match[2]));
}

/** Every storage operation checks the key first, so no input can reach a path outside the media folder. */
export function assertSafeKey(key: string): void {
  if (!isStorageKey(key)) throw new Error('Unsafe storage key');
}

/** Accepts only canonical decimal text (no sign, no decimal point, no leading zeros) for a valid variant width. */
export function parseWidth(raw: string): number | null {
  if (typeof raw !== 'string' || !/^[1-9][0-9]{0,3}$/.test(raw)) return null;
  const n = Number(raw);
  return isValidWidth(n) ? n : null;
}

export function parsePurpose(raw: unknown): 'gallery' | 'portrait' | null {
  return raw === 'gallery' || raw === 'portrait' ? raw : null;
}

/** Returns an explanation when an image uploaded for one purpose is attached to a record of another. */
export function purposeError(assetPurpose: string, required: 'gallery' | 'portrait'): string | null {
  return assetPurpose === required ? null : `This image was uploaded for ${assetPurpose} use. Upload a ${required} image instead.`;
}
