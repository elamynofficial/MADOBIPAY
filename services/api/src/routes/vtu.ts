import { Router } from 'express';
import { z } from 'zod';
import { withTx } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { fraudGuard } from '../middleware/fraud.js';
import { findUserById, verifyPin } from '../lib/session.js';
import { applyLedger, lockWallet, newRef } from '../lib/walletOps.js';
import { insertTx, publicTx } from '../lib/tx.js';
import { toKobo } from '../lib/money.js';

export const vtuRouter = Router();
vtuRouter.use(requireAuth, fraudGuard);

async function purchase(
  req: AuthedRequest,
  args: {
    service: 'airtime' | 'data' | 'electricity' | 'tv' | 'exam' | 'recharge_card' | 'sms';
    amount: number;
    title: string;
    subtitle: string;
    pin?: string;
    metadata?: Record<string, unknown>;
  },
) {
  const user = await findUserById(req.user!.sub);
  if (!user) throw new Error('Unauthorized');
  await verifyPin(user, args.pin);
  const kobo = toKobo(args.amount);
  const reference = newRef('MP');
  return withTx(async (client) => {
    const wallet = await lockWallet(client, user.id);
    await applyLedger(client, wallet, 'debit', kobo, reference, args.title);
    const tx = await insertTx(client, {
      userId: user.id,
      service: args.service,
      status: 'success',
      amountKobo: kobo,
      title: args.title,
      subtitle: args.subtitle,
      reference,
      providerRef: `STUB-${reference}`,
      metadata: { ...args.metadata, provider: 'stub' },
    });
    return { reference, status: 'success' as const, transaction: publicTx(tx) };
  });
}

vtuRouter.post('/airtime', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      network: z.string(),
      phone: z.string(),
      amount: z.number().positive(),
      pin: z.string().optional(),
    }).parse(req.body);
    const result = await purchase(req, {
      service: 'airtime',
      amount: body.amount,
      title: `${body.network.toUpperCase()} Airtime`,
      subtitle: body.phone,
      pin: body.pin,
      metadata: { network: body.network, phone: body.phone },
    });
    res.json({ service: 'airtime', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/data', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      network: z.string(),
      phone: z.string(),
      amount: z.number().positive(),
      planId: z.string().optional(),
      name: z.string().optional(),
      pin: z.string().optional(),
    }).parse(req.body);
    const result = await purchase(req, {
      service: 'data',
      amount: body.amount,
      title: body.name ?? `${body.network.toUpperCase()} Data`,
      subtitle: body.phone,
      pin: body.pin,
      metadata: { network: body.network, planId: body.planId, phone: body.phone },
    });
    res.json({ service: 'data', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/electricity/verify', (req, res) => {
  const meter = (req.body as { meter?: string }).meter ?? '';
  res.json({ name: 'OKORO EMEKA', meter, type: 'prepaid' });
});

vtuRouter.post('/electricity', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      disco: z.string(),
      meter: z.string(),
      amount: z.number().positive(),
      pin: z.string().optional(),
    }).parse(req.body);
    const result = await purchase(req, {
      service: 'electricity',
      amount: body.amount,
      title: `${body.disco.toUpperCase()} Prepaid`,
      subtitle: `Meter ${body.meter}`,
      pin: body.pin,
      metadata: { disco: body.disco, meter: body.meter, token: '4589-2031-7741-9920' },
    });
    res.json({ service: 'electricity', token: '4589-2031-7741-9920', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/tv', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      provider: z.string(),
      iuc: z.string(),
      amount: z.number().positive(),
      name: z.string().optional(),
      pin: z.string().optional(),
    }).parse(req.body);
    const result = await purchase(req, {
      service: 'tv',
      amount: body.amount,
      title: body.name ?? `${body.provider.toUpperCase()} subscription`,
      subtitle: `IUC ${body.iuc}`,
      pin: body.pin,
      metadata: { provider: body.provider, iuc: body.iuc },
    });
    res.json({ service: 'tv', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/exam-pins', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ amount: z.number().positive(), body: z.string().optional(), pin: z.string().optional() }).parse(req.body);
    const result = await purchase(req, {
      service: 'exam',
      amount: body.amount,
      title: `${(body.body ?? 'WAEC').toUpperCase()} PIN`,
      subtitle: 'Exam PIN',
      pin: body.pin,
    });
    res.json({ service: 'exam', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/recharge-cards', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ amount: z.number().positive(), network: z.string().optional(), pin: z.string().optional() }).parse(req.body);
    const result = await purchase(req, {
      service: 'recharge_card',
      amount: body.amount,
      title: `${(body.network ?? 'MTN').toUpperCase()} ePIN`,
      subtitle: 'Recharge card',
      pin: body.pin,
    });
    res.json({ service: 'recharge_card', ...result });
  } catch (err) {
    next(err);
  }
});

vtuRouter.post('/sms', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ amount: z.number().positive(), pin: z.string().optional() }).parse(req.body);
    const result = await purchase(req, {
      service: 'sms',
      amount: body.amount,
      title: 'Bulk SMS',
      subtitle: 'SMS units',
      pin: body.pin,
    });
    res.json({ service: 'sms', ...result });
  } catch (err) {
    next(err);
  }
});
