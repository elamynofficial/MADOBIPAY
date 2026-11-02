import type { DataPlan, Transaction, TvBouquet, User, VirtualAccount, Wallet } from '@/src/types/models';

export const demoUser: User = {
  id: 'usr_1',
  fullName: 'Chinedu Okeke',
  email: 'chinedu@madobipay.com',
  phone: '08031234567',
  role: 'customer',
  kycLevel: 1,
  referralCode: 'MADO-CHINEDU',
  hasPin: true,
  twoFactorEnabled: false,
};

export const demoWallet: Wallet = {
  available: 248650.42,
  ledger: 248650.42,
  cashback: 3250,
  referral: 12500,
};

export const demoVA: VirtualAccount = {
  bankName: 'Wema Bank',
  accountName: 'MADOBIPAY / Chinedu Okeke',
  accountNumber: '7821045631',
};

export const demoTxns: Transaction[] = [
  {
    id: 'txn_1',
    service: 'airtime',
    title: 'MTN Airtime',
    subtitle: '0803 123 4567',
    amount: -1000,
    status: 'success',
    createdAt: new Date().toISOString(),
    reference: 'MP2401AIR001',
  },
  {
    id: 'txn_2',
    service: 'data',
    title: 'Airtel SME 5GB',
    subtitle: '0802 998 1100',
    amount: -2500,
    status: 'success',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    reference: 'MP2401DAT014',
  },
  {
    id: 'txn_3',
    service: 'electricity',
    title: 'IKEDC Prepaid',
    subtitle: 'Meter 45012938761',
    amount: -15000,
    status: 'success',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    reference: 'MP2401ELC088',
  },
  {
    id: 'txn_4',
    service: 'funding',
    title: 'Wallet funding',
    subtitle: 'Paystack',
    amount: 50000,
    status: 'success',
    createdAt: new Date(Date.now() - 172800_000).toISOString(),
    reference: 'MP2401FND033',
  },
  {
    id: 'txn_5',
    service: 'tv',
    title: 'DStv Compact',
    subtitle: 'IUC 2019384756',
    amount: -15700,
    status: 'pending',
    createdAt: new Date(Date.now() - 4000_000).toISOString(),
    reference: 'MP2401TV009',
  },
];

export const dataPlans: DataPlan[] = [
  { id: 'mtn-sme-1', network: 'mtn', type: 'sme', name: '1.5GB SME', validity: '30 days', amount: 1000 },
  { id: 'mtn-sme-2', network: 'mtn', type: 'sme', name: '3GB SME', validity: '30 days', amount: 1500 },
  { id: 'mtn-corp-1', network: 'mtn', type: 'corporate', name: '6GB Corporate', validity: '30 days', amount: 2500 },
  { id: 'mtn-dir-1', network: 'mtn', type: 'direct', name: '11GB Direct', validity: '30 days', amount: 3500 },
  { id: 'air-sme-1', network: 'airtel', type: 'sme', name: '2GB SME', validity: '30 days', amount: 1200 },
  { id: 'glo-sme-1', network: 'glo', type: 'sme', name: '2.5GB SME', validity: '14 days', amount: 1000 },
  { id: '9m-sme-1', network: '9mobile', type: 'sme', name: '1.5GB SME', validity: '30 days', amount: 900 },
];

export const bouquets: TvBouquet[] = [
  { id: 'dstv-padi', provider: 'dstv', name: 'Padi', amount: 4400, months: 1 },
  { id: 'dstv-yanga', provider: 'dstv', name: 'Yanga', amount: 6000, months: 1 },
  { id: 'dstv-compact', provider: 'dstv', name: 'Compact', amount: 15700, months: 1 },
  { id: 'gotv-smallie', provider: 'gotv', name: 'Smallie', amount: 1900, months: 1 },
  { id: 'gotv-jolli', provider: 'gotv', name: 'Jolli', amount: 5800, months: 1 },
  { id: 'st-nova', provider: 'startimes', name: 'Nova', amount: 2100, months: 1 },
  { id: 'st-basic', provider: 'startimes', name: 'Basic', amount: 3700, months: 1 },
];

export const news = [
  { id: 'n1', title: 'Airtime cashback weekend', body: 'Get 2% back on all MTN and Airtel airtime till Sunday.' },
  { id: 'n2', title: 'IKEDC token delay', body: 'Prepaid tokens may take up to 10 minutes during peak hours.' },
];

export const banners = [
  { id: 'b1', title: 'Refer & earn ₦1,000', subtitle: 'Share your code with friends', tone: 'orange' },
  { id: 'b2', title: 'Fund with Monnify', subtitle: 'Instant virtual account credit', tone: 'sky' },
  { id: 'b3', title: 'Become an agent', subtitle: 'Unlock commissions on every sale', tone: 'red' },
];
