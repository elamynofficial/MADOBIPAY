import { Router } from 'express';
import { z } from 'zod';
import { pool, withTx } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { fraudGuard } from '../middleware/fraud.js';
import { findUserById, findUserByIdentifier, verifyPin } from '../lib/session.js';
import { normalizePhone } from '../lib/users.js';
import { applyLedger, lockWallet, newRef, publicWallet } from '../lib/walletOps.js';
import { insertTx, publicTx } from '../lib/tx.js';
import { toKobo } from '../lib/money.js';
import {
  creditPaystackCharge,
  insertPendingFunding,
  missingPaystackMessage,
  paystackConfigured,
  paystackInitialize,
  paystackVerify,
} from '../lib/paystack.js';

export const walletRouter = Router();
walletRouter.use(requireAuth);

walletRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.sub;
    const wallet = (await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId])).rows[0];
    const va = (await pool.query(
      'SELECT bank_name, account_name, account_number FROM virtual_accounts WHERE user_id = $1',
      [userId],
    )).rows[0];
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({
      wallet: publicWallet(wallet),
      va: va
        ? { bankName: va.bank_name, accountName: va.account_name, accountNumber: va.account_number }
        : { bankName: 'Wema Bank', accountName: 'MADOBIPAY', accountNumber: '0000000000' },
    });
  } catch (err) {
    next(err);
  }
});

walletRouter.post('/fund', fraudGuard, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      amount: z.number().positive(),
      provider: z.string().optional(),
      callbackUrl: z.string().url().optional(),
    }).parse(req.body);
    const user = await findUserById(req.user!.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const provider = (body.provider ?? 'paystack').toLowerCase();
    if (provider === 'monnify') {
      return res.status(501).json({ message: 'Monnify is not implemented. Use Paystack.' });
    }
    if (provider !== 'paystack') {
      return res.status(400).json({
        message: 'Card and bank funding use Paystack. Bank transfer to your virtual account is shown in the app; it does not auto-credit yet.',
      });
    }
    if (!paystackConfigured()) {
      return res.status(503).json({ message: missingPaystackMessage() });
    }
    const kobo = toKobo(body.amount);
    if (kobo < 10_000) return res.status(400).json({ message: 'Minimum funding is ₦100' });
    const reference = newRef('PSK');
    const callbackUrl = body.callbackUrl ?? 'http://localhost:8083/fund-wallet';
    const init = await paystackInitialize({
      email: user.email,
      amountKobo: kobo,
      reference,
      callbackUrl,
      userId: user.id,
    });
    await insertPendingFunding(user.id, kobo, init.reference);
    res.json({
      provider: 'paystack',
      reference: init.reference,
      authorizationUrl: init.authorization_url,
      accessCode: init.access_code,
      status: 'pending',
    });
  } catch (err) {
    next(err);
  }
});

walletRouter.post('/fund/verify', async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({ reference: z.string().min(4) }).parse(req.body);
    if (!paystackConfigured()) {
      return res.status(503).json({ message: missingPaystackMessage() });
    }
    const paid = await paystackVerify(body.reference);
    if (paid.status !== 'success') {
      return res.status(400).json({ message: `Payment not successful (${paid.status})`, status: paid.status, reference: paid.reference });
    }
    const pending = (await pool.query<{ user_id: string }>('SELECT user_id FROM transactions WHERE reference = $1', [paid.reference])).rows[0];
    if (pending && pending.user_id !== req.user!.sub) {
      return res.status(403).json({ message: 'This payment belongs to another account' });
    }
    const result = await creditPaystackCharge({
      reference: paid.reference,
      amountKobo: paid.amount,
      userId: pending?.user_id ?? paid.metadata?.userId ?? req.user!.sub,
      providerRef: String(paid.id),
    });
    res.json({ reference: paid.reference, status: 'success', alreadyCredited: result.already, transaction: result.transaction });
  } catch (err) {
    next(err);
  }
});

walletRouter.post('/transfer', fraudGuard, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      phone: z.string().min(10),
      amount: z.number().positive(),
      pin: z.string().optional(),
    }).parse(req.body);
    const sender = await findUserById(req.user!.sub);
    if (!sender) return res.status(401).json({ message: 'Unauthorized' });
    await verifyPin(sender, body.pin);
    const recipient = await findUserByIdentifier(normalizePhone(body.phone));
    if (!recipient || recipient.id === sender.id) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    const kobo = toKobo(body.amount);
    const reference = newRef('TRF');
    const tx = await withTx(async (client) => {
      const from = await lockWallet(client, sender.id);
      await applyLedger(client, from, 'debit', kobo, `${reference}-OUT`, `Transfer to ${recipient.phone}`);
      const to = await lockWallet(client, recipient.id);
      await applyLedger(client, to, 'credit', kobo, `${reference}-IN`, `Transfer from ${sender.phone}`);
      await insertTx(client, {
        userId: recipient.id,
        service: 'funding',
        status: 'success',
        amountKobo: kobo,
        title: 'Wallet transfer in',
        subtitle: sender.phone,
        reference: `${reference}-IN`,
      });
      return insertTx(client, {
        userId: sender.id,
        service: 'transfer',
        status: 'success',
        amountKobo: kobo,
        title: 'Wallet transfer',
        subtitle: recipient.phone,
        reference,
      });
    });
    res.json({ reference, amount: body.amount, phone: recipient.phone, transaction: publicTx(tx) });
  } catch (err) {
    next(err);
  }
});

walletRouter.post('/withdraw', fraudGuard, async (req: AuthedRequest, res, next) => {
  try {
    const body = z.object({
      amount: z.number().positive(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      pin: z.string().optional(),
    }).parse(req.body);
    const user = await findUserById(req.user!.sub);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    await verifyPin(user, body.pin);
    const kobo = toKobo(body.amount);
    const reference = newRef('WTH');
    const dest = body.accountNumber ?? 'bank account';
    const tx = await withTx(async (client) => {
      const wallet = await lockWallet(client, user.id);
      await applyLedger(client, wallet, 'debit', kobo, reference, `Withdrawal to ${dest} (stub payout)`);
      return insertTx(client, {
        userId: user.id,
        service: 'withdrawal',
        status: 'pending',
        amountKobo: kobo,
        title: 'Bank withdrawal',
        subtitle: dest,
        reference,
        metadata: { bankName: body.bankName, stub: true },
      });
    });
    res.json({ reference, amount: body.amount, status: 'pending', transaction: publicTx(tx) });
  } catch (err) {
    next(err);
  }
});
