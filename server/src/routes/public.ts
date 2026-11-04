import { Router } from 'express';
import { Types } from 'mongoose';
import { BusinessFact, Course, GalleryItem, LeadershipProfile, Testimonial } from '../models/Content.js';
import { isAssetPubliclyUsed, streamVariant } from '../media/service.js';
import { parseWidth } from '../media/format.js';
import { responsiveImage } from '../media/delivery.js';
import { MediaAsset } from '../models/Media.js';
import { Video } from '../models/Video.js';
import { isPortraitPublic, publicFilters, publicMediaCacheControl } from '../visibility.js';

export { isPortraitPublic, publicFilters } from '../visibility.js';

export const publicRouter = Router();

publicRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  next();
});

type Sized = { _id: unknown; width: number; height: number; variants: Array<{ width: number }> } | null;

/** Builds the responsive image description. Public URLs use media identifiers and widths, never storage keys. */
function imageFor(asset: Sized) {
  if (!asset) return null;
  return responsiveImage(String(asset._id), asset.variants, asset.width, asset.height);
}


// Video visibility is consent-gated and never cached, so a withdrawal takes effect on the next request.
publicRouter.get('/videos', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const rows = await Video.find(publicFilters.videos())
    .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .select('youtubeId title description category isFeatured displayOrder')
    .lean();
  res.json({ items: rows.map((v) => ({ id: String(v._id), title: v.title, description: v.description, category: v.category, isFeatured: v.isFeatured, embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtubeId}`, thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg` })) });
});

publicRouter.get('/courses', async (_req, res) => {
  const rows = await Course.find(publicFilters.courses()).sort({ displayOrder: 1, name: 1 }).select('name category description').lean();
  res.json({ items: rows.map((r) => ({ id: String(r._id), name: r.name, category: r.category, description: r.description })) });
});

publicRouter.get('/leadership', async (_req, res) => {
  const rows = await LeadershipProfile.find(publicFilters.leadership())
    .sort({ displayOrder: 1 })
    .select('profileType designation name qualifications experience biography responsibilities skills achievements visionMission studentMessage portraitAssetId photoPermission status verification')
    .populate({ path: 'portraitAssetId', select: 'width height variants' })
    .lean();
  // Internal fields never leave the server. A portrait is returned only when its permission is confirmed.
  res.json({
    items: rows.map((r) => ({
      profileType: r.profileType,
      designation: r.designation,
      name: r.name,
      qualifications: r.qualifications,
      experience: r.experience,
      biography: r.biography,
      responsibilities: r.responsibilities,
      skills: r.skills,
      achievements: r.achievements,
      visionMission: r.visionMission,
      studentMessage: r.studentMessage,
      photo: isPortraitPublic(r) ? imageFor(r.portraitAssetId as unknown as Sized) : null,
    })),
  });
});

publicRouter.get('/gallery', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const rows = await GalleryItem.find(publicFilters.gallery())
    .sort({ displayOrder: 1, createdAt: 1 })
    .select('category caption altText imageAssetId')
    .populate({ path: 'imageAssetId', select: 'width height variants' })
    .lean();
  const items = rows
    .map((r) => {
      const image = imageFor(r.imageAssetId as unknown as Sized);
      return image ? { id: String(r._id), category: r.category, caption: r.caption, altText: r.altText, ...image } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  res.json({ items });
});

publicRouter.get('/testimonials', async (_req, res) => {
  const rows = await Testimonial.find(publicFilters.testimonials()).sort({ displayOrder: 1, createdAt: -1 }).select('studentName courseName feedback rating').lean();
  res.json({ items: rows.map((r) => ({ id: String(r._id), studentName: r.studentName, courseName: r.courseName, feedback: r.feedback, rating: r.rating })) });
});

publicRouter.get('/facts', async (_req, res) => {
  const rows = await BusinessFact.find(publicFilters.facts()).select('key label value verificationSource').lean();
  res.json({ items: rows.map((r) => ({ key: r.key, label: r.label, value: r.value, source: r.verificationSource })) });
});

// Public image delivery. Only images used by a publicly visible record are served.
publicRouter.get('/media/:id/:width', async (req, res) => {
  const width = parseWidth(req.params.width);
  if (width === null || !Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found.' } });
    return;
  }
  const asset = await MediaAsset.findById(req.params.id).select('storageId variants purpose').lean();
  if (!asset || !asset.variants.some((v) => v.width === width)) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found.' } });
    return;
  }
  if (!(await isAssetPubliclyUsed(String(asset._id)))) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found.' } });
    return;
  }
  await streamVariant(res, asset.storageId, width, publicMediaCacheControl(asset.purpose));
});
