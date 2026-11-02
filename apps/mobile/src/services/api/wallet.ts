import { api, useLiveApi } from './client';
import { demoTxns, demoVA, demoWallet } from '@/src/services/mock/store';
import type { Transaction, VirtualAccount, Wallet } from '@/src/types/models';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function getWallet() {
  if (useLiveApi) return api<{ wallet: Wallet; va: VirtualAccount }>('/wallet');
  await delay();
  return { wallet: demoWallet, va: demoVA };
}

export async function getTransactions(filters?: { service?: string; status?: string }) {
  if (useLiveApi) {
    const q = new URLSearchParams();
    if (filters?.service && filters.service !== 'all') q.set('service', filters.service);
    if (filters?.status && filters.status !== 'all') q.set('status', filters.status);
    const qs = q.toString();
    return api<{ items: Transaction[] }>(`/transactions${qs ? `?${qs}` : ''}`);
  }
  await delay();
  let items = demoTxns;
  if (filters?.service && filters.service !== 'all') items = items.filter((t) => t.service === filters.service);
  if (filters?.status && filters.status !== 'all') items = items.filter((t) => t.status === filters.status);
  return { items };
}

export async function getTransaction(id: string) {
  if (useLiveApi) return api<{ item: Transaction }>(`/transactions/${id}`);
  await delay();
  const item = demoTxns.find((t) => t.id === id) ?? demoTxns[0];
  return { item };
}

export async function transferInternal(phone: string, amount: number, pin: string) {
  if (useLiveApi) return api('/wallet/transfer', 'POST', { phone, amount, pin });
  await delay();
  if (pin.length !== 4) throw new Error('Invalid PIN');
  return { reference: `MP${Date.now()}`, amount, phone };
}

export type FundInit = {
  provider: string;
  reference: string;
  authorizationUrl?: string;
  status: string;
};

export async function fundWallet(amount: number, provider: string, callbackUrl?: string) {
  if (useLiveApi) {
    return api<FundInit>('/wallet/fund', 'POST', { amount, provider, callbackUrl });
  }
  await delay();
  return { provider, reference: `FND${Date.now()}`, status: 'success' };
}

export async function verifyFund(reference: string) {
  if (useLiveApi) {
    return api<{ reference: string; status: string; alreadyCredited?: boolean }>('/wallet/fund/verify', 'POST', { reference });
  }
  await delay();
  return { reference, status: 'success' };
}

export async function withdrawWallet(amount: number, accountNumber: string, pin: string) {
  if (useLiveApi) return api('/wallet/withdraw', 'POST', { amount, accountNumber, pin });
  await delay();
  return { reference: `WTH${Date.now()}`, amount, status: 'pending' };
}
