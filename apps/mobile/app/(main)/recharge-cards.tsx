import { useState } from 'react';
import { Alert, Text } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { NetworkPicker } from '@/src/components/checkout/NetworkPicker';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { useTheme } from '@/src/theme/ThemeContext';

export default function RechargeCards() {
  const { theme } = useTheme();
  const [network, setNetwork] = useState('mtn');
  const [qty, setQty] = useState('5');
  const [denom, setDenom] = useState('200');
  const [open, setOpen] = useState(false);
  const amount = Number(qty) * Number(denom);

  const pdf = async () => {
    const html = `<h1>MADOBIPAY ${network.toUpperCase()} cards</h1>${Array.from({ length: Number(qty) }).map((_, i) => `<p>**** **** ${1000 + i} — ₦${denom}</p>`).join('')}`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <Screen>
      <PageHeader title="Recharge card printing" />
      <NetworkPicker value={network} onChange={setNetwork} />
      <Input label="Denomination" value={denom} onChangeText={setDenom} keyboardType="numeric" />
      <Input label="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
      <Card><Text style={{ color: theme.text, fontFamily: 'Outfit_700Bold' }}>Total ₦{amount || 0}</Text></Card>
      <Button label="Generate" onPress={() => setOpen(true)} />
      <Button label="Download PDF" variant="ghost" onPress={pdf} />
      <ConfirmSheet open={open} title={`Print ${qty} × ₦${denom} ${network}`} amount={amount} onClose={() => setOpen(false)} onConfirm={() => { setOpen(false); Alert.alert('Generated', 'Cards are ready to print'); }} />
    </Screen>
  );
}
