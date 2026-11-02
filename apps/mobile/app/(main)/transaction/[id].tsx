import { Alert, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { getTransaction } from '@/src/services/api/wallet';
import { formatDate, formatNaira } from '@/src/lib/format';
import { useTheme } from '@/src/theme/ThemeContext';
import { palette } from '@/src/theme/tokens';

const statusColor = {
  success: palette.success,
  pending: palette.warning,
  failed: palette.danger,
};

export default function TxDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const q = useQuery({
    queryKey: ['txn', id],
    queryFn: () => getTransaction(String(id)),
    retry: 0,
  });
  const tx = q.data?.item;
  if (!tx) {
    return (
      <Screen>
        <PageHeader title="Receipt" />
        <Text style={{ color: theme.muted, fontFamily: 'Outfit_400Regular' }}>{q.isError ? 'Transaction not found.' : 'Loading receipt…'}</Text>
      </Screen>
    );
  }
  const color = statusColor[tx.status] ?? palette.warning;

  const receiptHtml = `<!doctype html>
  <html><body style="font-family:Arial;padding:24px;color:#0F172A">
    <h2 style="color:#FF6F00;margin:0">MADOBIPAY</h2>
    <p style="color:#64748B">Official transaction receipt</p>
    <h1>${formatNaira(Math.abs(tx.amount))}</h1>
    <p><strong>${tx.title}</strong><br/>${tx.subtitle}</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td>Status</td><td>${tx.status}</td></tr>
      <tr><td>Reference</td><td>${tx.reference}</td></tr>
      <tr><td>Service</td><td>${tx.service}</td></tr>
      <tr><td>Fee</td><td>${formatNaira(tx.fee ?? 0)}</td></tr>
      <tr><td>Date</td><td>${formatDate(tx.createdAt)}</td></tr>
    </table>
    <p style="font-size:12px;color:#64748B">Need help? 0700 MADOBIPAY · 24/7</p>
  </body></html>`;

  const receipt = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: receiptHtml });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Receipt', 'Could not share the PDF on this device. Screenshot this screen instead.');
    }
  };

  const rows = [
    ['Service', tx.service.replace('_', ' ')],
    ['Destination', tx.subtitle],
    ['Reference', tx.reference],
    ['Fee', formatNaira(tx.fee ?? 0)],
    ['Date', formatDate(tx.createdAt)],
  ];

  return (
    <Screen>
      <PageHeader title="Receipt" />
      <Card>
        <Text style={{ textAlign: 'center', color: theme.muted, fontFamily: 'Outfit_500Medium' }}>MADOBIPAY</Text>
        <Text style={{ textAlign: 'center', fontFamily: 'Outfit_700Bold', fontSize: 28, color: theme.text, marginTop: 8 }}>
          {formatNaira(tx.amount)}
        </Text>
        <View style={{ alignSelf: 'center', marginTop: 8, backgroundColor: `${color}22`, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
          <Text style={{ color, fontFamily: 'Outfit_700Bold', textTransform: 'capitalize' }}>{tx.status}</Text>
        </View>
        <Text style={{ textAlign: 'center', fontFamily: 'Outfit_700Bold', fontSize: 16, color: theme.text, marginTop: 16 }}>{tx.title}</Text>
        {rows.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
            <Text style={{ color: theme.muted }}>{k}</Text>
            <Text style={{ color: theme.text, fontFamily: 'Outfit_600SemiBold', maxWidth: '60%', textAlign: 'right' }}>{v}</Text>
          </View>
        ))}
      </Card>
      <Button label="Download / share receipt" onPress={receipt} />
      <Button label="Report a problem" variant="ghost" onPress={() => Alert.alert('Support ticket', `Opened for ${tx.reference}. We reply within 15 minutes.`)} />
    </Screen>
  );
}
