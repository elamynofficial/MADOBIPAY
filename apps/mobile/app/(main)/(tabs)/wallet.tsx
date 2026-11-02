import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/src/components/ui/Screen';
import { BalanceCard } from '@/src/components/home/BalanceCard';
import { Card } from '@/src/components/ui/Card';
import { TxRow } from '@/src/components/ui/TxRow';
import { useTheme } from '@/src/theme/ThemeContext';
import { useWallet } from '@/src/context/WalletContext';
import { getTransactions } from '@/src/services/api/wallet';

export default function WalletScreen() {
  const { theme } = useTheme();
  const { va } = useWallet();
  const router = useRouter();
  const tx = useQuery({ queryKey: ['txns'], queryFn: () => getTransactions(), retry: 0 });
  const actions = [
    { label: 'Fund', href: '/fund-wallet' },
    { label: 'Virtual account', href: '/virtual-account' },
    { label: 'Transfer', href: '/transfer' },
    { label: 'Withdraw', href: '/withdraw' },
  ];
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text, marginBottom: 12 }}>Wallet</Text>
      <BalanceCard />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={() => router.push(a.href as never)} style={{ backgroundColor: theme.card, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14 }}>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
      <Card>
        <Text style={{ color: theme.muted }}>Dedicated account</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: theme.text }}>{va.accountNumber}</Text>
      </Card>
      <Text style={{ marginTop: 18, fontFamily: 'Outfit_700Bold', color: theme.text }}>Wallet history</Text>
      {(tx.data?.items ?? []).slice(0, 8).map((t) => (
        <TxRow key={t.id} item={t} onPress={() => router.push(`/transaction/${t.id}`)} />
      ))}
    </Screen>
  );
}
