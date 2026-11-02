import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';

const groups = [
  { title: 'Airtime & data', items: [
    { label: 'Airtime', href: '/airtime', icon: 'call-outline' as const },
    { label: 'Data', href: '/data', icon: 'wifi-outline' as const },
    { label: 'Recharge cards', href: '/recharge-cards', icon: 'print-outline' as const },
  ]},
  { title: 'Bills', items: [
    { label: 'Electricity', href: '/electricity', icon: 'flash-outline' as const },
    { label: 'TV', href: '/tv', icon: 'tv-outline' as const },
    { label: 'Exam PINs', href: '/exam-pins', icon: 'school-outline' as const },
    { label: 'Bulk SMS', href: '/bulk-sms', icon: 'chatbubbles-outline' as const },
  ]},
  { title: 'Money', items: [
    { label: 'Fund wallet', href: '/fund-wallet', icon: 'add-circle-outline' as const },
    { label: 'Transfer', href: '/transfer', icon: 'swap-horizontal-outline' as const },
    { label: 'Withdraw', href: '/withdraw', icon: 'arrow-up-circle-outline' as const },
  ]},
];

export default function Services() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text, marginBottom: 12 }}>Services</Text>
      {groups.map((g) => (
        <View key={g.title} style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.muted, fontFamily: 'Outfit_600SemiBold', marginBottom: 8 }}>{g.title}</Text>
          {g.items.map((it) => (
            <Pressable key={it.label} onPress={() => router.push(it.href as never)}>
              <Card style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name={it.icon} size={22} color={theme.primary} />
                  <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text, fontSize: 16 }}>{it.label}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </Screen>
  );
}
