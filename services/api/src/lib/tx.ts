import type { SqlClient } from '../db.js';
import { signedNaira, toNaira } from './money.js';

export type TxRow = {
  id: string;
  user_id: string;
  service: string;
  status: string;
  amount_kobo: string;
  fee_kobo: string;
  title: string;
  subtitle: string | null;
  provider_ref: string | null;
  reference: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function publicTx(row: TxRow) {
  return {
    id: row.id,
    service: row.service,
    title: row.title,
    subtitle: row.subtitle ?? '',
    amount: signedNaira(row.service, row.amount_kobo),
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    reference: row.reference,
    fee: toNaira(row.fee_kobo),
  };
}

export async function insertTx(
  client: SqlClient,
  args: {
    userId: string;
    service: string;
    status: string;
    amountKobo: number;
    title: string;
    subtitle: string;
    reference: string;
    metadata?: Record<string, unknown>;
    feeKobo?: number;
    providerRef?: string;
  },
) {
  const { rows } = await client.query<TxRow>(
    `INSERT INTO transactions
      (user_id, service, status, amount_kobo, fee_kobo, title, subtitle, provider_ref, reference, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
     RETURNING *`,
    [
      args.userId,
      args.service,
      args.status,
      args.amountKobo,
      args.feeKobo ?? 0,
      args.title,
      args.subtitle,
      args.providerRef ?? null,
      args.reference,
      JSON.stringify(args.metadata ?? {}),
    ],
  );
  return rows[0];
}
