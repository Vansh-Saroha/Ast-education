import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Please check the highlighted fields.', fields: err.flatten().fieldErrors },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(Object.entries(err.errors).map(([key, e]) => [key, [e.message]]));
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Please check the highlighted fields.', fields },
    });
    return;
  }

  const status = typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : 500;

  if (status === 413) {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'The request is too large.' } });
    return;
  }

  // Log the error type and route only. Messages and bodies can contain personal data.
  console.error(`[error] ${req.method} ${req.path} ${status} ${err instanceof Error ? err.name : 'UnknownError'}`);

  if (status >= 400 && status < 500) {
    res.status(status).json({ error: { code: 'BAD_REQUEST', message: 'The request could not be processed.' } });
    return;
  }

  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again later.' } });
}
