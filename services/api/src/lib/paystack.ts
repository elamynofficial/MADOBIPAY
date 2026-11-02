import { createHmac, timingSafeEqual } from 'node:crypto';
import { pool, withTx, type SqlClient } from '../db.js';
import { applyLedger, lockWallet } from './walletOps.js';
import { insertTx, publicTx, type TxRow } from './tx.js';

const PAYSTACK_API = 'https://api.paystack.co';

export function paystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';
}

export function paystackConfigured() {
  return paystackSecret().startsWith('sk_');
}

export function missingPaystackMessage() {
  return 'Paystack is not configured. Set PAYSTACK_SECRET_KEY in services/api/.env (Paystack Dashboard > Settings > API Keys > test secret, starts with sk_test_).';
}

type PaystackInit = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export async function paystackInitialize(args: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  userId: string;
}) {
  const secret = paystackSecret();
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      currency: 'NGN',
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: { userId: args.userId, source: 'madobipay' },
    }),
  });
  const json = (await res.json()) as { status: boolean; message?: string; data?: PaystackInit };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message ?? 'Paystack initialize failed');
  }
  return json.data;
}

export async function paystackVerify(reference: string) {
  const secret = paystackSecret();
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: {
      status: string;
      amount: number;
      reference: string;
      id: number;
      customer?: { email?: string };
      metadata?: { userId?: string };
    };
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message ?? 'Paystack verify failed');
  }
  return json.data;
}

export function verifyPaystackSignature(rawBody: Buffer, signature: string | undefined) {
  const secret = paystackSecret();
  if (!secret || !signature) return false;
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex');
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function findTx(client: SqlClient, reference: string, forUpdate = false) {
  const sql = forUpdate
    ? 'SELECT * FROM transactions WHERE reference = $1 LIMIT 1 FOR UPDATE'
    : 'SELECT * FROM transactions WHERE reference = $1 LIMIT 1';
  const { rows } = await client.query<TxRow>(sql, [reference]);
  return rows[0] ?? null;
}

export async function creditPaystackCharge(args: {
  reference: string;
  amountKobo: number;
  userId?: string;
  providerRef?: string;
}) {
  return withTx(async (client) => {
    let row = await findTx(client, args.reference, true);
    if (row?.status === 'success') {
      return { already: true, transaction: publicTx(row) };
    }
    const userId = args.userId ?? row?.user_id;
    if (!userId) throw new Error('Cannot credit wallet: unknown user for this Paystack reference');
    const kobo = row ? Number(row.amount_kobo) : args.amountKobo;
    const wallet = await lockWallet(client, userId);
    if (row?.status !== 'success') {
      await applyLedger(client, wallet, 'credit', kobo, args.reference, 'Wallet funding via Paystack');
    }
    if (row) {
      const updated = await client.query<TxRow>(
        `UPDATE transactions
         SET status = 'success', provider_ref = $1, metadata = $2::jsonb, updated_at = now()
         WHERE reference = $3
         RETURNING *`,
        [String(args.providerRef ?? args.reference), JSON.stringify({ provider: 'paystack' }), args.reference],
      );
      row = updated.rows[0];
    } else {
      row = await insertTx(client, {
        userId,
        service: 'funding',
        status: 'success',
        amountKobo: kobo,
        title: 'Wallet funding',
        subtitle: 'Paystack',
        reference: args.reference,
        providerRef: String(args.providerRef ?? args.reference),
        metadata: { provider: 'paystack' },
      });
    }
    return { already: false, transaction: publicTx(row) };
  });
}

export async function insertPendingFunding(userId: string, amountKobo: number, reference: string) {
  return insertTx(pool, {
    userId,
    service: 'funding',
    status: 'pending',
    amountKobo,
    title: 'Wallet funding',
    subtitle: 'Paystack',
    reference,
    metadata: { provider: 'paystack' },
  });
}
