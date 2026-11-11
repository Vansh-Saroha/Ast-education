import 'dotenv/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    ENQUIRY_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    // Image storage. Production must use an S3-compatible provider; local disk is for development and tests.
    MEDIA_STORAGE: z.enum(['local', 's3']).default('local'),
    MEDIA_LOCAL_DIR: z.string().min(1).default('var/media'),
    MEDIA_MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(10).default(6),
    S3_BUCKET: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).default('false'),
  })
  .superRefine((v, ctx) => {
    if (v.MEDIA_STORAGE === 's3') {
      for (const key of ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const) {
        if (!v[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required when MEDIA_STORAGE=s3` });
      }
    }
    if (v.NODE_ENV === 'production' && v.MEDIA_STORAGE !== 's3') {
      ctx.addIssue({ code: 'custom', path: ['MEDIA_STORAGE'], message: 'Production must use S3-compatible storage (MEDIA_STORAGE=s3)' });
    }
  });

// A blank line in .env (for example "S3_BUCKET=") means the setting is not set, so optional values use their defaults.
const configured = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== undefined && value !== ''));
const parsed = schema.safeParse(configured);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  clientOrigins: parsed.data.CLIENT_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
};
