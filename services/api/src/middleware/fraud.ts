import type { NextFunction, Request, Response } from 'express';

export function deviceTracker(req: Request, _res: Response, next: NextFunction) {
  req.headers['x-device-seen'] = (req.headers['x-device-id'] as string) ?? 'unknown';
  next();
}

export function fraudGuard(req: Request, res: Response, next: NextFunction) {
  const amount = Number((req.body as { amount?: number })?.amount ?? 0);
  if (amount > 5_000_000) {
    return res.status(422).json({ message: 'Amount exceeds fraud threshold. Contact support.' });
  }
  return next();
}
