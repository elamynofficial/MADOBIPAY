import { api, useLiveApi } from './client';
import { demoUser } from '@/src/services/mock/store';
import { secure } from '@/src/lib/storage';
import type { User } from '@/src/types/models';

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

async function persistTokens(res: { accessToken?: string; refreshToken?: string }) {
  if (res.accessToken) await secure.setAccess(res.accessToken);
  if (res.refreshToken) await secure.setRefresh(res.refreshToken);
}

export async function login(identifier: string, password: string) {
  if (useLiveApi) {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', 'POST', { identifier, password });
    await persistTokens(res);
    return res;
  }
  await delay();
  if (!password) throw new Error('Invalid credentials');
  await secure.setAccess('demo.access.jwt');
  await secure.setRefresh('demo.refresh.jwt');
  return { user: { ...demoUser, email: identifier.includes('@') ? identifier : demoUser.email, phone: identifier.includes('@') ? demoUser.phone : identifier }, accessToken: 'demo.access.jwt', refreshToken: 'demo.refresh.jwt' };
}

export async function register(payload: { fullName: string; email: string; phone: string; password: string; referralCode?: string }) {
  if (useLiveApi) return api('/auth/register', 'POST', payload);
  await delay();
  return { otpSent: true, destination: payload.phone };
}

export async function verifyOtp(otp: string, destination?: string) {
  if (useLiveApi) {
    const res = await api<{ user: User; accessToken?: string; refreshToken?: string }>('/auth/otp/verify', 'POST', { otp, destination });
    await persistTokens(res);
    return res;
  }
  await delay();
  if (otp !== '123456' && otp.length !== 6) throw new Error('Invalid OTP');
  await secure.setAccess('demo.access.jwt');
  await secure.setRefresh('demo.refresh.jwt');
  return { user: demoUser };
}

export async function requestPasswordReset(identifier: string) {
  if (useLiveApi) return api('/auth/password/forgot', 'POST', { identifier });
  await delay();
  return { otpSent: true };
}

export async function resetPassword(otp: string, password: string) {
  if (useLiveApi) return api('/auth/password/reset', 'POST', { otp, password });
  await delay();
  return { ok: true };
}

export async function fetchMe() {
  if (useLiveApi) return api<{ user: User }>('/auth/me');
  const token = await secure.getAccess();
  if (!token) throw new Error('Unauthenticated');
  return { user: demoUser };
}
