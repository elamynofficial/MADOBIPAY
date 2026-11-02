import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { formatNaira } from '@/src/lib/format';
import { useTheme } from '@/src/theme/ThemeContext';

const stats = [
  { label: 'Today sales', value: 18400 },
  { label: 'Commission', value: 1260 },
  { label: 'This week', value: 91200 },
  { label: 'Customers', value: 38, raw: true },
];

const actions = [
  { label: 'Sell airtime', href: '/airtime', icon: 'call-outline' as const },
  { label: 'Sell data', href: '/data', icon: 'wifi-outline' as const },
  { label: 'Pay bill', href: '/electricity', icon: 'flash-outline' as const },
  { label: 'Fund float', href: '/fund-wallet', icon: 'add-circle-outline' as const },
];

export default function AgentDashboard() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <PageHeader title="Agent shop" />
      <Card>
        <Text style={{ color: theme.muted }}>Float balance</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.text }}>{formatNaira(85000)}</Text>
        <Text style={{ color: theme.muted, marginTop: 4 }}>Okeke Communications · Surulere, Lagos</Text>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ width: '47%', flexGrow: 1 }}>
            <Text style={{ color: theme.muted }}>{s.label}</Text>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text, fontSize: 18 }}>
              {s.raw ? s.value : formatNaira(s.value)}
            </Text>
          </Card>
        ))}
      </View>
      <Text style={{ marginTop: 18, marginBottom: 8, fontFamily: 'Outfit_700Bold', color: theme.text }}>Quick sell</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={() => router.push(a.href as never)} style={{ width: '48%', marginBottom: 10 }}>
            <Card>
              <Ionicons name={a.icon} size={22} color={theme.primary} />
              <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text, marginTop: 8 }}>{a.label}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
      <Button label="Commission history" onPress={() => router.push('/agent/commissions')} />
      <Button label="Upgrade shop details" variant="ghost" onPress={() => router.push('/agent/register')} />
    </Screen>
  );
}
