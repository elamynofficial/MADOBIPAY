import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { apiLimiter } from './middleware/rateLimit.js';
import { deviceTracker } from './middleware/fraud.js';
import { authRouter } from './routes/auth.js';
import { walletRouter } from './routes/wallet.js';
import { vtuRouter } from './routes/vtu.js';
import { adminRouter } from './routes/admin.js';
import { handlePaystackWebhook, webhookRouter } from './routes/webhooks.js';
import { transactionsRouter } from './routes/transactions.js';
import { bootstrapDb, getEngine } from './db.js';
import { paystackConfigured } from './lib/paystack.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    if (/^https?:\/\/(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.post('/v1/webhooks/paystack', express.raw({ type: 'application/json' }), (req, res, next) => {
  void handlePaystackWebhook(req, res).catch(next);
});
app.use(express.json({ limit: '1mb' }));
app.use(deviceTracker);
app.use(apiLimiter);

app.get('/health', (_req, res) => res.json({
  ok: true,
  name: 'MADOBIPAY API',
  db: getEngine(),
  paystack: paystackConfigured(),
}));
app.use('/v1/auth', authRouter);
app.use('/v1/wallet', walletRouter);
app.use('/v1/vtu', vtuRouter);
app.use('/v1/transactions', transactionsRouter);
app.use('/v1/admin', adminRouter);
app.use('/v1/webhooks', webhookRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0]?.message ?? 'Invalid request' });
  }
  const status = err.message === 'Unauthorized' ? 401
    : err.message.includes('Insufficient') ? 422
    : err.message.includes('Invalid PIN') || err.message.includes('PIN is required') ? 401
    : 400;
  res.status(status).json({ message: err.message });
});

const port = Number(process.env.PORT ?? 4000);

async function main() {
  await bootstrapDb();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`MADOBIPAY API listening on 0.0.0.0:${port} (phone must use this PC's LAN IP, not 127.0.0.1)`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Another MADOBIPAY API is probably still running.`);
      console.error(`In PowerShell: netstat -ano | findstr :${port}   then   taskkill /PID <pid> /F`);
      process.exit(1);
    }
    throw err;
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
