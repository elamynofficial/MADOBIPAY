import { Alert, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { formatNaira } from '@/src/lib/format';

export default function Referral() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const link = `https://madobipay.com/r/${user?.referralCode}`;
  return (
    <Screen>
      <PageHeader title="Referrals" />
      <Card>
        <Text style={{ color: theme.muted }}>Earnings</Text>
        <Text style={{ fontSize: 32, fontFamily: 'Outfit_700Bold', color: theme.text }}>{formatNaira(12500)}</Text>
        <Text style={{ color: theme.muted, marginTop: 8 }}>12 successful referrals</Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={{ color: theme.muted }}>Your link</Text>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{link}</Text>
      </Card>
      <Button label="Copy link" onPress={() => Clipboard.setStringAsync(link)} />
      <Button label="Withdraw earnings" variant="ghost" onPress={() => Alert.alert('Requested', 'Referral payout queued')} />
    </Screen>
  );
}
