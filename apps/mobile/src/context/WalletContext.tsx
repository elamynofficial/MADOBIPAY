import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWallet } from '@/src/services/api/wallet';
import { useLiveApi } from '@/src/services/api/client';
import { prefs } from '@/src/lib/storage';
import { demoVA, demoWallet } from '@/src/services/mock/store';

const emptyWallet = { available: 0, ledger: 0, cashback: 0, referral: 0 };
const emptyVa = { bankName: '', accountName: '', accountNumber: '' };

const Ctx = createContext<{
  hidden: boolean;
  toggleHidden: () => void;
  wallet: typeof demoWallet;
  va: typeof demoVA;
  loading: boolean;
} | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const q = useQuery({ queryKey: ['wallet'], queryFn: getWallet, retry: 0 });

  const value = useMemo(
    () => ({
      hidden,
      toggleHidden: () => {
        setHidden((h) => {
          void prefs.set('hideBal', (!h).toString());
          return !h;
        });
      },
      wallet: q.data?.wallet ?? (useLiveApi ? emptyWallet : demoWallet),
      va: q.data?.va ?? (useLiveApi ? emptyVa : demoVA),
      loading: q.isLoading && !q.data,
    }),
    [hidden, q.data, q.isLoading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('WalletProvider missing');
  return ctx;
}

export function useHideBalance() {
  return useWallet();
}
