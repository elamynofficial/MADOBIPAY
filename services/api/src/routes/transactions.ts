import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { publicTx, type TxRow } from '../lib/tx.js';

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

transactionsRouter.get('/', async (req: AuthedRequest, res, next) => {
  try {
    const service = typeof req.query.service === 'string' ? req.query.service : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const { rows } = await pool.query<TxRow>(
      `SELECT * FROM transactions
       WHERE user_id = $1
         AND ($2::text IS NULL OR $2 = 'all' OR service::text = $2)
         AND ($3::text IS NULL OR $3 = 'all' OR status::text = $3)
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user!.sub, service ?? null, status ?? null],
    );
    res.json({ items: rows.map(publicTx) });
  } catch (err) {
    next(err);
  }
});

transactionsRouter.get('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query<TxRow>(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.sub],
    );
    if (!rows[0]) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ item: publicTx(rows[0]) });
  } catch (err) {
    next(err);
  }
});
