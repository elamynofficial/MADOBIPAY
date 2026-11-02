export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  pin_hash: string | null;
  role: string;
  avatar_url: string | null;
  referral_code: string;
  kyc_status: string;
  kyc_level: number;
  two_factor_enabled: boolean;
  is_active: boolean;
};

export function publicUser(row: UserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatar: row.avatar_url ?? undefined,
    kycLevel: row.kyc_level as 0 | 1 | 2 | 3,
    referralCode: row.referral_code,
    hasPin: Boolean(row.pin_hash),
    twoFactorEnabled: row.two_factor_enabled,
  };
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return `0${digits.slice(3)}`;
  if (digits.length === 10) return `0${digits}`;
  return digits;
}
