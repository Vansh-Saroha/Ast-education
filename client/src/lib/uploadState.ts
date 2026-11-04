// Upload state model. Pure, so the progress, success and error rules can be tested without a browser.

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024; // must match MEDIA_MAX_UPLOAD_MB on the server

export type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; percent: number }
  | { phase: 'processing' }
  | { phase: 'success'; assetId: string; name: string }
  | { phase: 'error'; message: string };

export type UploadEvent =
  | { type: 'start' }
  | { type: 'progress'; loaded: number; total: number }
  | { type: 'sent' }
  | { type: 'done'; assetId: string; name: string }
  | { type: 'fail'; message: string }
  | { type: 'reset' };

export function percentOf(loaded: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((loaded / total) * 100)));
}

export function reduce(state: UploadState, event: UploadEvent): UploadState {
  switch (event.type) {
    case 'reset':
      return { phase: 'idle' };
    case 'start':
      return { phase: 'uploading', percent: 0 };
    case 'progress':
      return state.phase === 'uploading' ? { phase: 'uploading', percent: percentOf(event.loaded, event.total) } : state;
    case 'sent':
      return state.phase === 'uploading' ? { phase: 'processing' } : state;
    case 'done':
      return state.phase === 'uploading' || state.phase === 'processing'
        ? { phase: 'success', assetId: event.assetId, name: event.name }
        : state;
    case 'fail':
      return { phase: 'error', message: event.message };
  }
}

/** Checks a file before it is sent, so obvious mistakes are explained without a round trip. */
export function validateFile(file: { type: string; size: number }): string | null {
  if (file.size === 0) return 'The file is empty. Choose another image.';
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Choose a JPEG, PNG or WebP image.';
  if (file.size > MAX_UPLOAD_BYTES) return 'The file is larger than 6 MB. Choose a smaller image.';
  return null;
}

/** Plain-language messages for server responses. The server's own message is preferred when it has one. */
export function messageForStatus(status: number): string {
  switch (status) {
    case 401: return 'Your session has ended. Sign in again to upload.';
    case 403: return 'You do not have permission to upload images.';
    case 413: return 'The file is too large. The maximum is 6 MB.';
    case 415: return 'Upload a JPEG, PNG or WebP image.';
    case 422: return 'This image could not be used. Try a different file.';
    case 429: return 'Too many uploads. Wait a few minutes and try again.';
    default: return 'The upload failed. Please try again.';
  }
}
