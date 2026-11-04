// Public and admin addressing of stored variants. Pure, so URLs can be tested against the stored widths.

export interface StoredVariant {
  width?: number | null;
}

/** The public address of one variant. Uses the image identifier and a width, never a storage key. */
export const variantUrl = (assetId: string, width: number, base = '/api/public/media'): string => `${base}/${assetId}/${width}`;

/** A responsive image description listing every stored variant, for use in a srcset. */
export function responsiveImage(
  assetId: string,
  variants: ReadonlyArray<StoredVariant>,
  width: number,
  height: number,
): { src: string; srcSet: string; width: number; height: number } | null {
  const widths = variants
    .map((v) => v.width)
    .filter((w): w is number => typeof w === 'number')
    .sort((a, b) => a - b);
  if (widths.length === 0) return null;
  return {
    src: variantUrl(assetId, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${variantUrl(assetId, w)} ${w}w`).join(', '),
    width,
    height,
  };
}

/** The variant the admin preview shows: the largest at or below the target, otherwise the smallest available. */
export function previewWidth(widths: ReadonlyArray<number>, target = 480): number | null {
  if (widths.length === 0) return null;
  const sorted = [...widths].sort((a, b) => a - b);
  const atOrBelow = sorted.filter((w) => w <= target);
  return atOrBelow.length > 0 ? atOrBelow[atOrBelow.length - 1] : sorted[0];
}
