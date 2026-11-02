import { Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { useWallet } from '@/src/context/WalletContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function VirtualAccount() {
  const { va } = useWallet();
  const { theme } = useTheme();
  return (
    <Screen>
      <PageHeader title="Virtual account" />
      <Card>
        <Text style={{ color: theme.muted }}>Bank</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: theme.text, marginBottom: 12 }}>{va.bankName}</Text>
        <Text style={{ color: theme.muted }}>Account name</Text>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text, marginBottom: 12 }}>{va.accountName}</Text>
        <Text style={{ color: theme.muted }}>Account number</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.text }}>{va.accountNumber}</Text>
      </Card>
      <Button label="Copy account number" onPress={() => Clipboard.setStringAsync(va.accountNumber)} />
    </Screen>
  );
}
