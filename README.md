# MADOBIPAY

Nigerian VTU + wallet app (Expo SDK 57) with an Express API. Database of record is **Supabase Postgres**. Paystack funds the wallet.

## Demo credentials

- Phone: `08031234567`
- Password: `Secret123`
- OTP: `123456`
- PIN: `1234`

Wallet is seeded at **₦248,650.42** (stored as kobo).

## 1. Supabase (source of truth)

MADOBIPAY project host:

`https://fetfdndpqzkmhrgxclhu.supabase.co`

1. Open [supabase.com](https://supabase.com) → this project.
2. **Project Settings → Database** → copy the URI and put your database password in place of `[YOUR-PASSWORD]`.
3. **Project Settings → API** → copy `anon` and `service_role` (service_role stays in `services/api/.env` only — never in the Expo app).
4. Edit `services/api/.env`:

```
SUPABASE_URL=https://fetfdndpqzkmhrgxclhu.supabase.co
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.fetfdndpqzkmhrgxclhu.supabase.co:5432/postgres?sslmode=require
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PG_EMBEDDED=false
```

5. Apply schema and demo user:

```powershell
cd C:\Users\elmuj\MADOBIPAY\services\api
npm run migrate
npm run seed
```

**Do not paste `CREATE USER` into PowerShell.**

Until `DATABASE_URL` is set, leave `PG_EMBEDDED=true` so `npm run dev` uses local PGlite.

## 2. Paystack (wallet funding)

From [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys (**test**):

```
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

Mobile only gets the public key:

```
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

Webhook (after you have a public API URL): `POST /v1/webhooks/paystack` with HMAC header `x-paystack-signature`. Local verify still works via `POST /v1/wallet/fund/verify` after checkout return.

Fund flow: app calls `POST /v1/wallet/fund` → Paystack `authorization_url` → user pays → callback/`verify` or webhook `charge.success` credits the ledger (idempotent on reference). Missing secret key returns **503**. Monnify is not implemented.

## 3. API

```powershell
cd C:\Users\elmuj\MADOBIPAY\services\api
npm install
npm run dev
```

`http://127.0.0.1:4000` — `GET /health` shows `"db":"pglite"` or `"postgres"` and `"paystack": true|false`. CORS allows Expo web on 8083.

If you see `EADDRINUSE :::4000`, an old API is still running (`tsx watch` used to restart after PGlite wrote files). Free the port, then start **one** server:

```powershell
cd C:\Users\elmuj\MADOBIPAY\services\api
powershell -File scripts\free-port-4000.ps1
npm run dev
```

Do **not** run `npx expo start` from the repo root (that pulls the wrong Expo and can fill the disk). Always `cd apps\mobile` first.

## 4. Mobile (Expo 57)

```powershell
cd C:\Users\elmuj\MADOBIPAY\apps\mobile
npm install
npx expo start --clear --web --port 8083
```

```
EXPO_PUBLIC_USE_LIVE_API=true
EXPO_PUBLIC_API_URL=http://127.0.0.1:4000/v1
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=
```

Restart Metro after changing `.env`. Android emulator: `http://10.0.2.2:4000/v1`.

## What is still stubbed

- Monnify
- VTU provider networks (wallet is still debited; transaction marked success)
- Bank withdrawals (debit + pending, no NIP payout)
- Electricity token is a demo string
"# MADOBIPAY" 
