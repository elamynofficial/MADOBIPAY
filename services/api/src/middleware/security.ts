import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
export const txLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

export function deviceTracker(req: Request, _res: Response, next: NextFunction) {
  req.headers['x-device-id'] = req.header('x-device-id') ?? 'unknown';
  next();
}

export function fraudGuard(req: Request, res: Response, next: NextFunction) {
  const amount = Number((req.body as { amount?: number })?.amount ?? 0);
  if (amount > 5_000_000) return res.status(422).json({ message: 'Amount flagged for review' });
  next();
}
