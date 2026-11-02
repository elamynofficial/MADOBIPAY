import 'dotenv/config';
import { bootstrapDb, closeDb, isEmbedded, pool } from '../db.js';
import { hashPassword, sha256 } from '../lib/crypto.js';

const PHONE = '08031234567';
const EMAIL = 'chinedu@madobipay.com';
const NAME = 'Chinedu Okeke';
const PASSWORD = 'Secret123';
const PIN = '1234';
const OTP = process.env.DEMO_OTP ?? '123456';
const AVAILABLE_KOBO = 24_865_042;
const CASHBACK_KOBO = 325_000;
const REFERRAL_KOBO = 1_250_000;

async function upsertUser(args: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode: string;
  availableKobo: number;
  cashbackKobo?: number;
  referralKobo?: number;
  accountNumber: string;
}) {
  const passwordHash = await hashPassword(args.password);
  const pinHash = await hashPassword(PIN);
  const existing = await pool.query<{ id: string }>('SELECT id FROM users WHERE phone = $1 OR email = $2', [args.phone, args.email]);
  let userId = existing.rows[0]?.id;
  if (userId) {
    await pool.query(
      `UPDATE users SET full_name=$1, email=$2, password_hash=$3, pin_hash=$4, referral_code=$5, kyc_level=1, kyc_status='verified', updated_at=now()
       WHERE id=$6`,
      [args.fullName, args.email, passwordHash, pinHash, args.referralCode, userId],
    );
  } else {
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO users (full_name, email, phone, password_hash, pin_hash, referral_code, kyc_level, kyc_status)
       VALUES ($1,$2,$3,$4,$5,$6,1,'verified')
       RETURNING id`,
      [args.fullName, args.email, args.phone, passwordHash, pinHash, args.referralCode],
    );
    userId = inserted.rows[0].id;
  }

  await pool.query(
    `INSERT INTO wallets (user_id, available_kobo, ledger_kobo, cashback_kobo, referral_kobo)
     VALUES ($1,$2,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE SET
       available_kobo = EXCLUDED.available_kobo,
       ledger_kobo = EXCLUDED.ledger_kobo,
       cashback_kobo = EXCLUDED.cashback_kobo,
       referral_kobo = EXCLUDED.referral_kobo,
       updated_at = now()`,
    [userId, args.availableKobo, args.cashbackKobo ?? 0, args.referralKobo ?? 0],
  );

  await pool.query(
    `INSERT INTO virtual_accounts (user_id, provider, bank_name, account_name, account_number)
     VALUES ($1, 'stub', 'Wema Bank', $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       account_name = EXCLUDED.account_name,
       account_number = EXCLUDED.account_number`,
    [userId, `MADOBIPAY / ${args.fullName}`, args.accountNumber],
  );

  await pool.query(
    `INSERT INTO otps (destination, purpose, code_hash, expires_at)
     VALUES ($1, 'register', $2, now() + interval '30 days')`,
    [args.phone, sha256(OTP)],
  );

  return userId;
}

export async function seedDemo() {
  const demoId = await upsertUser({
    fullName: NAME,
    email: EMAIL,
    phone: PHONE,
    password: PASSWORD,
    referralCode: 'MADO-CHINEDU',
    availableKobo: AVAILABLE_KOBO,
    cashbackKobo: CASHBACK_KOBO,
    referralKobo: REFERRAL_KOBO,
    accountNumber: '7821045631',
  });

  await upsertUser({
    fullName: 'Amaka Obi',
    email: 'amaka@madobipay.com',
    phone: '08021239876',
    password: PASSWORD,
    referralCode: 'MADO-AMAKA',
    availableKobo: 5_000_000,
    accountNumber: '7821045632',
  });

  const samples = [
    ['airtime', 'success', 100_000, 'MTN Airtime', '0803 123 4567', 'MP2401AIR001'],
    ['data', 'success', 250_000, 'Airtel SME 5GB', '0802 998 1100', 'MP2401DAT014'],
    ['electricity', 'success', 1_500_000, 'IKEDC Prepaid', 'Meter 45012938761', 'MP2401ELC088'],
    ['funding', 'success', 5_000_000, 'Wallet funding', 'Paystack', 'MP2401FND033'],
    ['tv', 'pending', 1_570_000, 'DStv Compact', 'IUC 2019384756', 'MP2401TV009'],
  ] as const;

  for (const [service, status, kobo, title, subtitle, reference] of samples) {
    await pool.query(
      `INSERT INTO transactions (user_id, service, status, amount_kobo, title, subtitle, reference)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (reference) DO NOTHING`,
      [demoId, service, status, kobo, title, subtitle, reference],
    );
  }

  const plans = [
    ['mtn', 'sme', '1.5GB SME', '30 days', 100_000, 'mtn-sme-1'],
    ['mtn', 'sme', '3GB SME', '30 days', 150_000, 'mtn-sme-2'],
    ['mtn', 'corporate', '6GB Corporate', '30 days', 250_000, 'mtn-corp-1'],
    ['airtel', 'sme', '2GB SME', '30 days', 120_000, 'air-sme-1'],
  ];
  for (const [network, type, name, validity, amount, code] of plans) {
    await pool.query(
      `INSERT INTO data_plans (network, type, name, validity, amount_kobo, provider_code)
       SELECT $1,$2,$3,$4,$5,$6
       WHERE NOT EXISTS (SELECT 1 FROM data_plans WHERE provider_code = $6)`,
      [network, type, name, validity, amount, code],
    );
  }

  console.log(`seeded demo user ${PHONE} / ${PASSWORD} (OTP ${OTP}, PIN ${PIN})`);
}

const invoked = process.argv[1]?.replace(/\\/g, '/').includes('scripts/seed');
if (invoked) {
  void (async () => {
    if (isEmbedded()) await bootstrapDb();
    else await seedDemo();
    await closeDb();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
