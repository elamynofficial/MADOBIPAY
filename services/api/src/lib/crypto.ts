import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access';
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh';

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function newRefreshToken() {
  return randomBytes(48).toString('hex');
}

export function signAccess(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, ACCESS_SECRET, { expiresIn: '7d' });
}

export function signRefresh(userId: string, sessionId: string) {
  return jwt.sign({ sub: userId, sid: sessionId }, REFRESH_SECRET, { expiresIn: '30d' });
}

export function referralCode(fullName: string) {
  const slug = fullName.replace(/[^A-Za-z]/g, '').slice(0, 8).toUpperCase() || 'USER';
  return `MADO-${slug}${randomBytes(2).toString('hex').toUpperCase()}`;
}
