import { createHash } from 'node:crypto';
import type { CookieOptions, NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AdminSession, AdminUser } from '../models/Admin.js';

export const SESSION_COOKIE = 'ast_admin';
export const SESSION_MS = 8 * 60 * 60 * 1000;

export interface AdminContext {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'staff';
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminContext;
    }
  }
}

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export function cookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  };
}

function deny(res: Response): void {
  res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' } });
}

/**
 * Cross-site forms cannot set custom headers without a CORS preflight, which the origin allowlist refuses.
 * Requiring this header on every state-changing admin request blocks forged requests even if a cookie is sent.
 */
export function requireAdminHeader(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.get('X-Admin-Request') === '1') {
    next();
    return;
  }
  res.status(403).json({ error: { code: 'FORBIDDEN', message: 'This request is not allowed.' } });
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || token.length < 32) {
    deny(res);
    return;
  }

  const session = await AdminSession.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) {
    deny(res);
    return;
  }

  const admin = await AdminUser.findById(session.admin).select('email name role active').lean();
  if (!admin || !admin.active) {
    deny(res);
    return;
  }

  req.admin = {
    id: String(admin._id),
    email: admin.email,
    name: admin.name,
    role: admin.role as 'owner' | 'staff',
  };
  next();
}

export function requireRole(role: 'owner') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.admin?.role === role) {
      next();
      return;
    }
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have access to this action.' } });
  };
}
