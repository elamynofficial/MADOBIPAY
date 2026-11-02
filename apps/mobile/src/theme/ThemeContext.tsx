import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme } from './tokens';
import { prefs } from '@/src/lib/storage';

type Mode = 'light' | 'dark' | 'system';

const Ctx = createContext<{ theme: AppTheme; mode: Mode; setMode: (m: Mode) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');
  const theme = useMemo(() => {
    const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [mode, system]);

  const setMode = (m: Mode) => {
    setModeState(m);
    void prefs.set('theme', m);
  };

  return <Ctx.Provider value={{ theme, mode, setMode }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('ThemeProvider missing');
  return ctx;
}
