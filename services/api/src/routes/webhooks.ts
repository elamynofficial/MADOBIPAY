import { Router, type Request, type Response } from 'express';
import {
  creditPaystackCharge,
  missingPaystackMessage,
  paystackConfigured,
  verifyPaystackSignature,
} from '../lib/paystack.js';

export const webhookRouter = Router();

export async function handlePaystackWebhook(req: Request, res: Response) {
  if (!paystackConfigured()) {
    return res.status(503).json({ message: missingPaystackMessage() });
  }
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
  const signature = req.header('x-paystack-signature');
  if (!verifyPaystackSignature(raw, signature)) {
    return res.status(401).json({ message: 'Invalid Paystack signature' });
  }
  let payload: {
    event?: string;
    data?: { status?: string; amount?: number; reference?: string; id?: number; metadata?: { userId?: string } };
  };
  try {
    payload = JSON.parse(raw.toString('utf8')) as typeof payload;
  } catch {
    return res.status(400).json({ message: 'Invalid JSON' });
  }
  if (payload.event === 'charge.success' && payload.data?.reference) {
    await creditPaystackCharge({
      reference: payload.data.reference,
      amountKobo: payload.data.amount ?? 0,
      userId: payload.data.metadata?.userId,
      providerRef: payload.data.id != null ? String(payload.data.id) : payload.data.reference,
    });
  }
  return res.json({ received: true });
}

webhookRouter.post('/monnify', (_req, res) => {
  res.status(501).json({ message: 'Monnify is not implemented. Use Paystack to fund the wallet.' });
});
