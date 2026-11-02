import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { useQueryClient } from '@tanstack/react-query';
import { DISCOS } from '@/src/data/catalog';
import { useTheme } from '@/src/theme/ThemeContext';
import { buyElectricity } from '@/src/services/api/vtu';

export default function Electricity() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [disco, setDisco] = useState('ikedc');
  const [meter, setMeter] = useState('45012938761');
  const [amount, setAmount] = useState(5000);
  const [name, setName] = useState<string>();
  const [open, setOpen] = useState(false);

  const verify = () => {
    if (meter.length < 10) return Alert.alert('Invalid meter', 'Enter a valid meter number');
    setName('OKORO EMEKA · Prepaid');
  };

  return (
    <Screen>
      <PageHeader title="Electricity" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {DISCOS.map((d) => (
          <Pressable key={d.id} onPress={() => setDisco(d.id)} style={{ padding: 10, borderRadius: 12, backgroundColor: disco === d.id ? theme.primary : theme.card }}>
            <Text style={{ color: disco === d.id ? '#fff' : theme.text, fontFamily: 'Outfit_600SemiBold', fontSize: 12 }}>{d.name}</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Meter number" value={meter} onChangeText={setMeter} keyboardType="number-pad" />
      <Button label="Verify customer" variant="ghost" onPress={verify} />
      {name ? <Card><Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{name}</Text></Card> : null}
      <Input label="Amount" value={String(amount)} onChangeText={(t) => setAmount(Number(t) || 0)} keyboardType="numeric" />
      <Button label="Pay" onPress={() => name ? setOpen(true) : Alert.alert('Verify first', 'Confirm the meter before paying')} />
      <ConfirmSheet open={open} title={`${disco.toUpperCase()} ${meter}`} amount={amount} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          const res = await buyElectricity({ disco, meter, amount, pin });
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Token generated', res.token ?? '4589-2031-7741-9920');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
