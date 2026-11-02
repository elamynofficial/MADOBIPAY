import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin', 'super_admin'));

adminRouter.get('/analytics', (_req, res) => {
  res.json({
    dailyRevenue: 1_240_500,
    weeklyRevenue: 8_112_000,
    monthlyRevenue: 31_440_200,
    totalUsers: 18420,
    activeUsers: 6390,
    transactionVolume: 112_004,
    profitSummary: 4_812_000,
    commissionSummary: 612_400,
  });
});

adminRouter.get('/users', (_req, res) => res.json({ items: [] }));
adminRouter.get('/agents', (_req, res) => res.json({ items: [] }));
adminRouter.get('/wallets', (_req, res) => res.json({ items: [] }));
adminRouter.get('/transactions', (_req, res) => res.json({ items: [] }));
adminRouter.get('/tickets', (_req, res) => res.json({ items: [] }));
