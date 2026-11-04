import { Router } from 'express';
import { Enquiry } from '../models/Enquiry.js';
import { enquirySchema } from '../validators/enquiry.js';
import { enquiryLimiter } from '../middleware/rateLimit.js';

const RECEIVED = {
  received: true,
  message: 'Thank you. Your enquiry has been recorded. Our team may contact you on the number you provided.',
};
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export const enquiryRouter = Router();

enquiryRouter.post('/', enquiryLimiter, async (req, res) => {
  const body = req.body ?? {};

  // Honeypot: people never see or fill this field. Accept silently and store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    res.status(201).json(RECEIVED);
    return;
  }

  const { website: _honeypot, ...fields } = enquirySchema.parse(body);

  // Same mobile and course within 10 minutes: treat as a double submit and do not store a second copy.
  const duplicate = await Enquiry.exists({
    mobile: fields.mobile,
    interestedCourse: fields.course,
    createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
  });

  if (!duplicate) {
    await Enquiry.create({
      studentName: fields.studentName,
      mobile: fields.mobile,
      email: fields.email,
      qualification: fields.qualification,
      interestedCourse: fields.course,
      message: fields.message,
      consent: fields.consent,
      consentAt: new Date(),
      sourcePage: fields.sourcePage,
    });
  }

  // Identical response for duplicates, so the endpoint does not reveal what is already stored.
  res.status(201).json(RECEIVED);
});
