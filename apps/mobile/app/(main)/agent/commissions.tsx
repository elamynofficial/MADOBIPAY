import { Text, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { formatNaira } from '@/src/lib/format';
import { useTheme } from '@/src/theme/ThemeContext';

const rows = [
  { id: '1', title: 'MTN airtime ₦1,000', amount: 18, date: 'Today · 09:14', customer: '0803 *** 4567' },
  { id: '2', title: 'IKEDC prepaid', amount: 120, date: 'Today · 08:02', customer: 'Meter 4501***' },
  { id: '3', title: 'Airtel SME 5GB', amount: 45, date: 'Yesterday · 19:40', customer: '0802 *** 1100' },
  { id: '4', title: 'DStv Compact', amount: 210, date: 'Yesterday · 16:11', customer: 'IUC 2019***' },
  { id: '5', title: 'Glo 2.5GB', amount: 32, date: 'Mon · 11:20', customer: '0805 *** 2211' },
];

export default function Commissions() {
  const { theme } = useTheme();
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <Screen>
      <PageHeader title="Commission history" />
      <Card>
        <Text style={{ color: theme.muted }}>Settled this week</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 26, color: theme.text }}>{formatNaira(total)}</Text>
        <Text style={{ color: theme.muted, marginTop: 4 }}>Payout every Friday to your MADOBIPAY wallet</Text>
      </Card>
      {rows.map((r) => (
        <Card key={r.id} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text, flex: 1 }}>{r.title}</Text>
            <Text style={{ color: theme.success, fontFamily: 'Outfit_700Bold' }}>+{formatNaira(r.amount)}</Text>
          </View>
          <Text style={{ color: theme.muted, marginTop: 4 }}>{r.customer} · {r.date}</Text>
        </Card>
      ))}
    </Screen>
  );
}
