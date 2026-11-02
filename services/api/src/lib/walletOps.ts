import type { SqlClient } from '../db.js';
import { toNaira } from './money.js';

export type WalletRow = {
  id: string;
  user_id: string;
  available_kobo: string;
  ledger_kobo: string;
  cashback_kobo: string;
  referral_kobo: string;
};

export async function lockWallet(client: SqlClient, userId: string) {
  const { rows } = await client.query<WalletRow>(
    'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
    [userId],
  );
  if (!rows[0]) throw new Error('Wallet not found');
  return rows[0];
}

export async function applyLedger(
  client: SqlClient,
  wallet: WalletRow,
  type: 'credit' | 'debit',
  amountKobo: number,
  reference: string,
  narration: string,
) {
  if (amountKobo <= 0) throw new Error('Amount must be greater than zero');
  const available = Number(wallet.available_kobo);
  if (type === 'debit' && available < amountKobo) throw new Error('Insufficient wallet balance');
  const next = type === 'credit' ? available + amountKobo : available - amountKobo;
  await client.query(
    `UPDATE wallets SET available_kobo = $1, ledger_kobo = $1, updated_at = now() WHERE id = $2`,
    [next, wallet.id],
  );
  await client.query(
    `INSERT INTO ledger_entries (wallet_id, type, amount_kobo, balance_after, reference, narration)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [wallet.id, type, amountKobo, next, reference, narration],
  );
  return { ...wallet, available_kobo: String(next), ledger_kobo: String(next) };
}

export function publicWallet(row: {
  available_kobo: string | number;
  ledger_kobo: string | number;
  cashback_kobo: string | number;
  referral_kobo: string | number;
}) {
  return {
    available: toNaira(row.available_kobo),
    ledger: toNaira(row.ledger_kobo),
    cashback: toNaira(row.cashback_kobo),
    referral: toNaira(row.referral_kobo),
  };
}

export function newRef(prefix: string) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
