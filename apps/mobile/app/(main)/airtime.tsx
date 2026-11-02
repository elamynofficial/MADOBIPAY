import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { NetworkPicker } from '@/src/components/checkout/NetworkPicker';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { buyAirtime } from '@/src/services/api/vtu';

const amounts = [100, 200, 500, 1000, 2000, 5000];
const contacts = [
  { name: 'Self', phone: '' },
  { name: 'Amaka', phone: '08021239876' },
  { name: 'Tunde', phone: '08134550921' },
];

export default function Airtime() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [network, setNetwork] = useState('mtn');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [amount, setAmount] = useState(1000);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      <PageHeader title="Airtime" />
      <NetworkPicker value={network} onChange={setNetwork} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {contacts.map((c) => (
          <Pressable key={c.name} onPress={() => setPhone(c.phone || user?.phone || '')} style={{ backgroundColor: theme.card, padding: 10, borderRadius: 12 }}>
            <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{c.name}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Text style={{ color: theme.muted, marginBottom: 8, fontFamily: 'Outfit_500Medium' }}>Quick amounts</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {amounts.map((a) => (
          <Pressable key={a} onPress={() => setAmount(a)} style={{ backgroundColor: amount === a ? theme.primary : theme.card, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }}>
            <Text style={{ color: amount === a ? '#fff' : theme.text, fontFamily: 'Outfit_600SemiBold' }}>₦{a}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Amount" keyboardType="numeric" value={String(amount)} onChangeText={(t) => setAmount(Number(t) || 0)} />
      <Button label="Continue" onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`${network.toUpperCase()} airtime to ${phone}`} amount={amount} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          await buyAirtime({ network, phone, amount, pin });
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Success', 'Airtime sent');
          router.replace('/history');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
