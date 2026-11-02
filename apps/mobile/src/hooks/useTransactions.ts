import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/src/services/api/wallet';

export function useTransactions(filters?: { service?: string; status?: string }) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => getTransactions(filters),
  });
}
