import { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { useTheme } from '@/src/theme/ThemeContext';
import { withdrawWallet } from '@/src/services/api/wallet';

const saved = [
  { bank: 'GTBank', number: '0142893310', name: 'Chinedu Okeke' },
  { bank: 'Access Bank', number: '0691128845', name: 'Chinedu Okeke' },
];

export default function Withdraw() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('10000');
  const [acc, setAcc] = useState(saved[0].number);
  const [open, setOpen] = useState(false);
  return (
    <Screen>
      <PageHeader title="Withdraw" />
      {saved.map((a) => (
        <Pressable key={a.number} onPress={() => setAcc(a.number)}>
          <Card style={{ marginBottom: 8, borderWidth: acc === a.number ? 1.5 : 0, borderColor: theme.primary }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{a.bank}</Text>
            <Text style={{ color: theme.muted }}>{a.number} · {a.name}</Text>
          </Card>
        </Pressable>
      ))}
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Button label="Withdraw to bank" onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`Withdraw to ${acc}`} amount={Number(amount) || 0} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          await withdrawWallet(Number(amount) || 0, acc, pin);
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Processing', 'Bank payout queued (stub — no live payout provider)');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
