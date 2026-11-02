import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/src/components/ui/Screen';
import { TxRow } from '@/src/components/ui/TxRow';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useTheme } from '@/src/theme/ThemeContext';
import { getTransactions } from '@/src/services/api/wallet';

const filters = ['all', 'airtime', 'data', 'electricity', 'tv', 'funding'] as const;
const statuses = ['all', 'success', 'pending', 'failed'] as const;

export default function History() {
  const { theme } = useTheme();
  const router = useRouter();
  const [service, setService] = useState<(typeof filters)[number]>('all');
  const [status, setStatus] = useState<(typeof statuses)[number]>('all');
  const q = useQuery({
    queryKey: ['txns', service, status],
    queryFn: () => getTransactions({ service, status }),
    retry: 0,
  });
  const items = q.data?.items ?? [];

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text }}>History</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 12 }}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setService(f)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: service === f ? theme.primary : theme.card }}>
            <Text style={{ color: service === f ? '#fff' : theme.text, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
        {statuses.map((s) => (
          <Pressable key={s} onPress={() => setStatus(s)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: status === s ? theme.primary : theme.card }}>
            <Text style={{ color: status === s ? '#fff' : theme.text, fontFamily: 'Outfit_500Medium', fontSize: 12 }}>{s}</Text>
          </Pressable>
        ))}
      </View>
      {q.isLoading ? (
        <EmptyState title="Loading" body="Fetching your transactions." />
      ) : items.length === 0 ? (
        <EmptyState title="No transactions" body="Try another filter or make your first purchase." />
      ) : items.map((t) => <TxRow key={t.id} item={t} onPress={() => router.push(`/transaction/${t.id}`)} />)}
    </Screen>
  );
}
