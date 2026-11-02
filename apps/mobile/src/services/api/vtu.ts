import { api, useLiveApi } from './client';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

type PurchaseResult = { reference: string; status: string; transaction?: { id: string } };

export async function buyAirtime(payload: { network: string; phone: string; amount: number; pin: string }) {
  if (useLiveApi) return api<PurchaseResult>('/vtu/airtime', 'POST', payload);
  await delay();
  return { reference: `MP${Date.now()}`, status: 'success' };
}

export async function buyData(payload: { network: string; phone: string; amount: number; name?: string; planId?: string; pin: string }) {
  if (useLiveApi) return api<PurchaseResult>('/vtu/data', 'POST', payload);
  await delay();
  return { reference: `MP${Date.now()}`, status: 'success' };
}

export async function buyElectricity(payload: { disco: string; meter: string; amount: number; pin: string }) {
  if (useLiveApi) return api<PurchaseResult & { token?: string }>('/vtu/electricity', 'POST', payload);
  await delay();
  return { reference: `MP${Date.now()}`, status: 'success', token: '4589-2031-7741-9920' };
}

export async function buyTv(payload: { provider: string; iuc: string; amount: number; name?: string; pin: string }) {
  if (useLiveApi) return api<PurchaseResult>('/vtu/tv', 'POST', payload);
  await delay();
  return { reference: `MP${Date.now()}`, status: 'success' };
}
