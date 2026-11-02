import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { hashPassword, referralCode, sha256, signAccess, verifyPassword, REFRESH_SECRET } from '../lib/crypto.js';
import { findUserById, findUserByIdentifier, issueSession } from '../lib/session.js';
import { normalizePhone, publicUser, type UserRow } from '../lib/users.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({
      fullName: z.string().min(3),
      email: z.string().email(),
      phone: z.string().min(10),
      password: z.string().min(8),
      referralCode: z.string().optional(),
    }).parse(req.body);

    const phone = normalizePhone(body.phone);
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [body.email, phone],
    );
    if (existing.rowCount) return res.status(409).json({ message: 'Email or phone already registered' });

    const referred = body.referralCode
      ? (await pool.query<{ id: string }>('SELECT id FROM users WHERE referral_code = $1', [body.referralCode])).rows[0]
      : undefined;

    const passwordHash = await hashPassword(body.password);
    const code = referralCode(body.fullName);
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [body.fullName, body.email, phone, passwordHash, code, referred?.id ?? null],
    );
    const user = rows[0];
    await pool.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);
    await pool.query(
      `INSERT INTO virtual_accounts (user_id, provider, bank_name, account_name, account_number)
       VALUES ($1, 'stub', 'Wema Bank', $2, $3)`,
      [user.id, `MADOBIPAY / ${body.fullName}`, `78${String(Date.now()).slice(-8)}`],
    );

    const otp = process.env.DEMO_OTP ?? '123456';
    await pool.query(
      `INSERT INTO otps (destination, purpose, code_hash, expires_at)
       VALUES ($1, 'register', $2, now() + interval '15 minutes')`,
      [phone, sha256(otp)],
    );

    res.json({ otpSent: true, destination: phone });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({ identifier: z.string(), password: z.string() }).parse(req.body);
    const identifier = body.identifier.includes('@') ? body.identifier : normalizePhone(body.identifier);
    const user = await findUserByIdentifier(identifier);
    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const session = await issueSession(user, { userAgent: req.get('user-agent') ?? undefined });
    res.json({
      accessToken: session.accessToken,
      refreshToken: session.rawRefresh,
      user: session.user,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
  const hash = sha256(refreshToken);
  const { rows } = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM sessions
     WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [hash],
  );
  if (rows[0]) {
    const user = await findUserById(rows[0].user_id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    return res.json({ accessToken: signAccess(user.id, user.role) });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { sub: string };
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    return res.json({ accessToken: signAccess(user.id, user.role) });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

authRouter.post('/otp/verify', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({
      otp: z.string().min(4),
      destination: z.string().optional(),
      purpose: z.string().optional(),
    }).parse(req.body);
    const dest = body.destination ? normalizePhone(body.destination) : undefined;
    const { rows } = await pool.query<{ id: string; destination: string }>(
      `SELECT id, destination FROM otps
       WHERE code_hash = $1
         AND consumed_at IS NULL
         AND expires_at > now()
         AND ($2::text IS NULL OR destination = $2)
         AND ($3::text IS NULL OR purpose = $3)
       ORDER BY created_at DESC
       LIMIT 1`,
      [sha256(body.otp), dest ?? null, body.purpose ?? null],
    );
    const otp = rows[0];
    if (!otp) return res.status(400).json({ message: 'Invalid or expired OTP' });
    await pool.query('UPDATE otps SET consumed_at = now() WHERE id = $1', [otp.id]);
    const user = await findUserByIdentifier(otp.destination);
    if (!user) return res.status(404).json({ message: 'User not found for this OTP' });
    const session = await issueSession(user, { userAgent: req.get('user-agent') ?? undefined });
    res.json({
      accessToken: session.accessToken,
      refreshToken: session.rawRefresh,
      user: session.user,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/password/forgot', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({ identifier: z.string() }).parse(req.body);
    const identifier = body.identifier.includes('@') ? body.identifier : normalizePhone(body.identifier);
    const user = await findUserByIdentifier(identifier);
    if (user) {
      const otp = process.env.DEMO_OTP ?? '123456';
      await pool.query(
        `INSERT INTO otps (destination, purpose, code_hash, expires_at)
         VALUES ($1, 'reset', $2, now() + interval '15 minutes')`,
        [user.phone, sha256(otp)],
      );
    }
    res.json({ otpSent: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/password/reset', authLimiter, async (req, res, next) => {
  try {
    const body = z.object({ otp: z.string(), password: z.string().min(8), destination: z.string().optional() }).parse(req.body);
    const dest = body.destination ? normalizePhone(body.destination) : undefined;
    const { rows } = await pool.query<{ id: string; destination: string }>(
      `SELECT id, destination FROM otps
       WHERE code_hash = $1 AND purpose = 'reset' AND consumed_at IS NULL AND expires_at > now()
         AND ($2::text IS NULL OR destination = $2)
       ORDER BY created_at DESC LIMIT 1`,
      [sha256(body.otp), dest ?? null],
    );
    if (!rows[0]) return res.status(400).json({ message: 'Invalid OTP' });
    await pool.query('UPDATE otps SET consumed_at = now() WHERE id = $1', [rows[0].id]);
    const hash = await hashPassword(body.password);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE phone = $2', [hash, rows[0].destination]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.user!.sub);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: publicUser(user) });
});
