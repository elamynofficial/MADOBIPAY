import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { BalanceCard } from '@/src/components/home/BalanceCard';
import { ServiceGrid } from '@/src/components/home/ServiceGrid';
import { BannerSlider } from '@/src/components/home/BannerSlider';
import { TxRow } from '@/src/components/ui/TxRow';
import { useAuth } from '@/src/context/AuthContext';
import { useWallet } from '@/src/context/WalletContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { getTransactions } from '@/src/services/api/wallet';
import { news } from '@/src/services/mock/store';
import { formatNaira } from '@/src/lib/format';
import * as Clipboard from 'expo-clipboard';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { va, wallet } = useWallet();
  const { theme } = useTheme();
  const router = useRouter();
  const tx = useQuery({ queryKey: ['txns'], queryFn: () => getTransactions(), retry: 0 });
  const items = tx.data?.items.slice(0, 4) ?? [];

  return (
    <Screen>
      <Text style={{ color: theme.muted, fontFamily: 'Outfit_400Regular' }}>{greeting()}</Text>
      <Text style={{ fontSize: 24, fontFamily: 'Outfit_700Bold', color: theme.text, marginBottom: 16 }}>
        {user?.fullName ?? 'Chinedu Okeke'}
      </Text>
      <BalanceCard />
      <Card delay={80}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.muted, fontFamily: 'Outfit_500Medium' }}>Virtual account</Text>
          <Text style={{ color: theme.success, fontFamily: 'Outfit_600SemiBold', fontSize: 12 }}>Active</Text>
        </View>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 22, color: theme.text, marginVertical: 4 }}>{va.accountNumber}</Text>
        <Text style={{ color: theme.muted }}>{va.bankName} · {va.accountName}</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
          <Pressable onPress={() => Clipboard.setStringAsync(va.accountNumber)}>
            <Text style={{ color: theme.primary, fontFamily: 'Outfit_600SemiBold' }}>Copy number</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/virtual-account')}>
            <Text style={{ color: theme.primary, fontFamily: 'Outfit_600SemiBold' }}>Share details</Text>
          </Pressable>
        </View>
      </Card>
      <Text style={{ marginTop: 18, marginBottom: 8, fontFamily: 'Outfit_700Bold', color: theme.text, fontSize: 16 }}>Quick services</Text>
      <ServiceGrid />
      <BannerSlider />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Pressable onPress={() => router.push('/referral')} style={{ flex: 1 }}>
          <Card>
            <Text style={{ color: theme.muted }}>Referral</Text>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{formatNaira(wallet.referral)}</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/cashback')} style={{ flex: 1 }}>
          <Card>
            <Text style={{ color: theme.muted }}>Cashback</Text>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{formatNaira(wallet.cashback)}</Text>
          </Card>
        </Pressable>
      </View>
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text, fontSize: 16 }}>Recent transactions</Text>
        <Pressable onPress={() => router.push('/history')}>
          <Text style={{ color: theme.primary, fontFamily: 'Outfit_600SemiBold' }}>See all</Text>
        </Pressable>
      </View>
      {items.map((item) => (
        <TxRow key={item.id} item={item} onPress={() => router.push(`/transaction/${item.id}`)} />
      ))}
      <Text style={{ marginTop: 16, fontFamily: 'Outfit_700Bold', color: theme.text }}>News</Text>
      {news.map((n) => (
        <Card key={n.id} style={{ marginTop: 8 }}>
          <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{n.title}</Text>
          <Text style={{ color: theme.muted, marginTop: 4 }}>{n.body}</Text>
        </Card>
      ))}
    </Screen>
  );
}
