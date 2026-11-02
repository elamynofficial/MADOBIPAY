import { useState } from 'react';
import { secure } from '@/src/lib/storage';

export function usePin() {
  const [busy, setBusy] = useState(false);
  const verify = async (pin: string) => {
    setBusy(true);
    try {
      const saved = await secure.getPin();
      if (!saved) return pin.length === 4;
      return saved === pin;
    } finally {
      setBusy(false);
    }
  };
  return { verify, busy };
}
