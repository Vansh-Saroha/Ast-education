// The single definition of what the public website may show. Tests check these rules directly.
export const publicFilters = {
  courses: () => ({ status: 'published', verification: 'verified' }),
  leadership: () => ({ status: 'published', verification: 'verified' }),
  gallery: () => ({ status: 'published', verification: 'verified', permissionConfirmed: true }),
  testimonials: () => ({ status: 'published', verification: 'verified', consentStatus: 'confirmed' }),
  videos: () => ({ status: 'published', consentStatus: 'confirmed', $or: [{ isMinor: false }, { guardianConsentConfirmed: true }] }),
  facts: () => ({ verification: 'verified', value: { $ne: '' } }),
};

export interface PortraitRecord {
  status?: string;
  verification?: string;
  photoPermission?: string;
  portraitAssetId?: unknown;
}

/** A portrait is public only when the profile is published and verified, and the owner has confirmed photo permission. */
export function isPortraitPublic(record: PortraitRecord): boolean {
  return (
    record.status === 'published' &&
    record.verification === 'verified' &&
    record.photoPermission === 'confirmed' &&
    !!record.portraitAssetId
  );
}

export interface GalleryRecord {
  status?: string;
  verification?: string;
  permissionConfirmed?: boolean;
  imageAssetId?: unknown;
}

export function isGalleryItemPublic(record: GalleryRecord): boolean {
  return (
    record.status === 'published' &&
    record.verification === 'verified' &&
    record.permissionConfirmed === true &&
    !!record.imageAssetId
  );
}

/**
 * Permission-bearing images are never cached: withdrawing publication permission must take effect on the next request.
 */
export function publicMediaCacheControl(purpose: 'gallery' | 'portrait'): string {
  return 'private, no-store';
}
