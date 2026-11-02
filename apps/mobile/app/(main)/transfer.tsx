import { useState } from 'react';
import { Alert } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { transferInternal } from '@/src/services/api/wallet';

export default function Transfer() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('2000');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  return (
    <Screen>
      <PageHeader title="Transfer to MADOBIPAY" />
      <Input label="Recipient phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Button label="Continue" onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`Send to ${phone}`} amount={Number(amount) || 0} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          await transferInternal(phone, Number(amount), pin);
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Sent', 'Internal transfer completed');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
