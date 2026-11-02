import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { useTheme } from '@/src/theme/ThemeContext';

export default function BulkSms() {
  const { theme } = useTheme();
  const [units, setUnits] = useState(100);
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('08031234567,08021239876');
  const [open, setOpen] = useState(false);
  const cost = units * 2.5;
  return (
    <Screen>
      <PageHeader title="Bulk SMS" />
      <Card><Text style={{ color: theme.muted }}>SMS wallet</Text><Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text, fontSize: 22 }}>1,240 units</Text></Card>
      <Input label="Buy units" value={String(units)} onChangeText={(t) => setUnits(Number(t) || 0)} keyboardType="numeric" />
      <Button label={`Buy units · ₦${cost}`} onPress={() => setOpen(true)} />
      <Input label="Recipients" value={recipients} onChangeText={setRecipients} />
      <Input label="Message" value={message} onChangeText={setMessage} multiline />
      <Button label="Send SMS" variant="ghost" onPress={() => Alert.alert('Queued', 'Messages are sending')} />
      <ConfirmSheet open={open} title={`${units} SMS units`} amount={cost} onClose={() => setOpen(false)} onConfirm={() => { setOpen(false); Alert.alert('Units added'); }} />
    </Screen>
  );
}
