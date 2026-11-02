export function toKobo(naira: number) {
  return Math.round(Number(naira) * 100);
}

export function toNaira(kobo: number | string) {
  return Number(kobo) / 100;
}

const CREDIT_SERVICES = new Set(['funding', 'cashback', 'referral', 'commission']);

export function signedNaira(service: string, amountKobo: number | string) {
  const naira = toNaira(amountKobo);
  return CREDIT_SERVICES.has(service) ? naira : -naira;
}
