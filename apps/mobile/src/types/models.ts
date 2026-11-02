export type Role = 'customer' | 'agent' | 'admin' | 'super_admin';
export type TxStatus = 'success' | 'pending' | 'failed';
export type TxService =
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'tv'
  | 'exam'
  | 'recharge_card'
  | 'sms'
  | 'funding'
  | 'transfer'
  | 'withdrawal'
  | 'cashback'
  | 'referral';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  kycLevel: 0 | 1 | 2 | 3;
  referralCode: string;
  hasPin: boolean;
  twoFactorEnabled: boolean;
};

export type Wallet = {
  available: number;
  ledger: number;
  cashback: number;
  referral: number;
};

export type VirtualAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export type Transaction = {
  id: string;
  service: TxService;
  title: string;
  subtitle: string;
  amount: number;
  status: TxStatus;
  createdAt: string;
  reference: string;
  fee?: number;
};

export type DataPlan = {
  id: string;
  network: string;
  type: 'sme' | 'corporate' | 'direct';
  name: string;
  validity: string;
  amount: number;
};

export type TvBouquet = {
  id: string;
  provider: string;
  name: string;
  amount: number;
  months: number;
};
