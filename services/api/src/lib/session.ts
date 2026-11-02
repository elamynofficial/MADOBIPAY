import type pg from 'pg';
import { pool } from '../db.js';
import { newRefreshToken, sha256, signAccess, signRefresh } from './crypto.js';
import { publicUser, type UserRow } from './users.js';

export async function issueSession(user: UserRow, meta?: { userAgent?: string; ip?: string }) {
  const refresh = newRefreshToken();
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO sessions (user_id, refresh_token_hash, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, now() + interval '30 days')
     RETURNING id`,
    [user.id, sha256(refresh), meta?.userAgent ?? null, meta?.ip && meta.ip !== '::1' ? meta.ip : null],
  );
  const sessionId = rows[0].id;
  return {
    accessToken: signAccess(user.id, user.role),
    refreshToken: signRefresh(user.id, sessionId),
    sessionId,
    rawRefresh: refresh,
    user: publicUser(user),
  };
}

export async function findUserById(id: string) {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1 AND is_active = true', [id]);
  return rows[0] ?? null;
}

export async function findUserByIdentifier(identifier: string) {
  const { rows } = await pool.query<UserRow>(
    `SELECT * FROM users WHERE is_active = true AND (email = $1 OR phone = $1) LIMIT 1`,
    [identifier],
  );
  return rows[0] ?? null;
}

export async function verifyPin(user: UserRow, pin: string | undefined) {
  if (!user.pin_hash) return true;
  if (!pin || pin.length < 4) throw new Error('PIN is required');
  const bcrypt = await import('bcryptjs');
  const ok = await bcrypt.default.compare(pin, user.pin_hash);
  if (!ok) throw new Error('Invalid PIN');
}
