import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { adminRouter } from './routes/admin.js';
import { enquiryRouter } from './routes/enquiries.js';
import { publicRouter } from './routes/public.js';
import { testimonialAdminRouter } from './routes/testimonials.js';
import { testimonialPublicRouter } from './routes/testimonials.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);
  app.use(helmet());
  app.use(
    cors({
      // Only the configured frontend origins may call the API from a browser.
      origin: (origin, callback) => callback(null, !origin || env.clientOrigins.includes(origin)),
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      // Only the headers the application sends. X-Admin-Request is still required server-side for every admin write.
      allowedHeaders: ['Content-Type', 'X-Admin-Request', 'X-Filename'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api/enquiries', enquiryRouter);
  app.use('/api/public', testimonialPublicRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
