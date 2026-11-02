import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/src/types/models';
import { fetchMe, login as loginApi, register as registerApi, verifyOtp as verifyOtpApi } from '@/src/services/api/auth';
import { secure } from '@/src/lib/storage';

type AuthCtx = {
  user: User | null;
  booting: boolean;
  login: (id: string, password: string) => Promise<void>;
  register: (p: { fullName: string; email: string; phone: string; password: string; referralCode?: string }) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('auth-timeout')), ms)),
      ]);

    (async () => {
      try {
        const token = await withTimeout(secure.getAccess(), 800);
        if (token && alive) {
          const me = await withTimeout(fetchMe(), 4000);
          if (alive) setUser(me.user);
        }
      } catch {
        try {
          await secure.clearSession();
        } catch {
          /* ignore */
        }
      } finally {
        if (alive) setBooting(false);
      }
    })();

    const failsafe = setTimeout(() => {
      if (alive) setBooting(false);
    }, 2000);

    return () => {
      alive = false;
      clearTimeout(failsafe);
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      booting,
      setUser,
      login: async (id, password) => {
        const res = await loginApi(id, password);
        setUser(res.user);
        await queryClient.invalidateQueries({ queryKey: ['wallet'] });
        await queryClient.invalidateQueries({ queryKey: ['txns'] });
      },
      register: async (p) => {
        await registerApi(p);
      },
      verifyOtp: async (otp) => {
        const res = await verifyOtpApi(otp);
        setUser(res.user);
        await queryClient.invalidateQueries({ queryKey: ['wallet'] });
        await queryClient.invalidateQueries({ queryKey: ['txns'] });
      },
      logout: async () => {
        await secure.clearSession();
        setUser(null);
        queryClient.clear();
      },
    }),
    [user, booting, queryClient],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
