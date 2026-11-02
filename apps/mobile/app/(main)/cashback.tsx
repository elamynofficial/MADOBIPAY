import { Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';
import { formatNaira } from '@/src/lib/format';

const bonuses = [
  { id: '1', title: 'Airtime cashback', amount: 20, date: 'Today' },
  { id: '2', title: 'Data weekend bonus', amount: 150, date: 'Yesterday' },
  { id: '3', title: 'Electricity 1%', amount: 150, date: 'Mon' },
];

export default function Cashback() {
  const { theme } = useTheme();
  return (
    <Screen>
      <PageHeader title="Cashback" />
      <Card>
        <Text style={{ color: theme.muted }}>Available rewards</Text>
        <Text style={{ fontSize: 32, fontFamily: 'Outfit_700Bold', color: theme.text }}>{formatNaira(3250)}</Text>
      </Card>
      {bonuses.map((b) => (
        <Card key={b.id} style={{ marginTop: 8 }}>
          <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{b.title}</Text>
          <Text style={{ color: theme.success }}>+{formatNaira(b.amount)} · {b.date}</Text>
        </Card>
      ))}
    </Screen>
  );
}
