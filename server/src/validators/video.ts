import { z } from 'zod';
import { VIDEO_CATEGORIES, VIDEO_STATUSES } from '../models/Video.js';

const youtubeIdFromUrl = (value: string): string | null => {
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    let id: string | null = null;
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else if (/^\/(shorts|embed)\/[A-Za-z0-9_-]{11}\/?$/.test(u.pathname)) id = u.pathname.split('/')[2];
    } else if (host === 'youtu.be' && /^\/[A-Za-z0-9_-]{11}\/?$/.test(u.pathname)) {
      id = u.pathname.split('/')[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
};

const urlSchema = z.string().trim().min(1).max(500).refine((v) => youtubeIdFromUrl(v) !== null, 'Enter a valid YouTube video URL.');
const base = {
  youtubeUrl: urlSchema,
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).default(''),
  category: z.enum(VIDEO_CATEGORIES),
  status: z.enum(VIDEO_STATUSES).default('draft'),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  consentStatus: z.enum(['pending', 'confirmed', 'withdrawn']).default('pending'),
  consentEvidence: z.string().trim().max(300).default(''),
  isMinor: z.boolean().default(false),
  guardianConsentConfirmed: z.boolean().default(false),
};
export const createVideoSchema = z.object(base).strict();
export const updateVideoSchema = z.object({
  youtubeUrl: urlSchema.optional(), title: base.title.optional(), description: base.description.optional(),
  category: base.category.optional(), status: base.status.optional(), isFeatured: base.isFeatured.optional(),
  displayOrder: base.displayOrder.optional(), consentStatus: base.consentStatus.optional(),
  consentEvidence: base.consentEvidence.optional(), isMinor: base.isMinor.optional(),
  guardianConsentConfirmed: base.guardianConsentConfirmed.optional(),
}).strict().refine((v) => Object.keys(v).length > 0, 'Nothing to update.');
export const getYouTubeId = youtubeIdFromUrl;
