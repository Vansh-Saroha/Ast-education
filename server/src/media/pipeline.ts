import sharp from 'sharp';
import { MAX_DIMENSION, MAX_PIXELS, detectFormat, plannedWidths, type ImageFormat } from './format.js';

export class MediaError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export interface Variant {
  width: number;
  height: number;
  data: Buffer;
}

export interface ProcessedImage {
  format: ImageFormat;
  width: number;
  height: number;
  variants: Variant[];
}

/**
 * Validates an uploaded image by its actual content, then produces optimised WebP variants.
 * - Orientation is applied from EXIF, and all metadata (including GPS and camera data) is removed.
 * - Images are never enlarged. The widths come from plannedWidths(), the same rule the storage keys use.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const declared = detectFormat(input);
  if (!declared) throw new MediaError(422, 'UNSUPPORTED_CONTENT', 'The file is not a JPEG, PNG or WebP image.');

  const options = { limitInputPixels: MAX_PIXELS, failOn: 'error' as const };
  let meta: sharp.Metadata;
  try {
    meta = await sharp(input, options).metadata();
  } catch {
    throw new MediaError(422, 'DECODE_FAILED', 'The image could not be read. It may be damaged.');
  }
  if (meta.format !== declared) {
    throw new MediaError(422, 'CONTENT_MISMATCH', 'The file content does not match a supported image format.');
  }
  if (!meta.width || !meta.height || Math.max(meta.width, meta.height) > MAX_DIMENSION) {
    throw new MediaError(422, 'TOO_LARGE_DIMENSIONS', `Images must be no larger than ${MAX_DIMENSION} pixels on the longest side.`);
  }

  let master: { data: Buffer; info: { width: number; height: number } };
  try {
    // Lossless, oriented master. Re-encoding drops all metadata because nothing asks for it to be kept.
    master = await sharp(input, options).rotate().png({ compressionLevel: 6 }).toBuffer({ resolveWithObject: true });
  } catch {
    throw new MediaError(422, 'DECODE_FAILED', 'The image could not be processed. It may be damaged.');
  }

  const widths = plannedWidths(master.info.width);
  const variants: Variant[] = [];
  for (const target of widths) {
    const out = await sharp(master.data)
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    // A mismatch would mean the stored width differs from the planned one. That is an internal fault, not a user error.
    if (out.info.width !== target) throw new Error(`Variant width ${out.info.width} does not match planned width ${target}`);
    variants.push({ width: target, height: out.info.height, data: out.data });
  }
  const largest = variants[variants.length - 1];
  return { format: declared, width: largest.width, height: largest.height, variants };
}
