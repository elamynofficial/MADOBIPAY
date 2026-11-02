import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { TV_PROVIDERS } from '@/src/data/catalog';
import { useQueryClient } from '@tanstack/react-query';
import { bouquets } from '@/src/services/mock/store';
import { formatNaira } from '@/src/lib/format';
import { useTheme } from '@/src/theme/ThemeContext';
import { buyTv } from '@/src/services/api/vtu';

export default function Tv() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState('dstv');
  const [iuc, setIuc] = useState('2019384756');
  const [bouquetId, setBouquetId] = useState('dstv-compact');
  const [open, setOpen] = useState(false);
  const list = useMemo(() => bouquets.filter((b) => b.provider === provider), [provider]);
  const bq = list.find((b) => b.id === bouquetId) ?? list[0];

  return (
    <Screen>
      <PageHeader title="TV subscription" />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {TV_PROVIDERS.map((p) => (
          <Pressable key={p.id} onPress={() => setProvider(p.id)} style={{ padding: 12, borderRadius: 12, backgroundColor: provider === p.id ? theme.primary : theme.card }}>
            <Text style={{ color: provider === p.id ? '#fff' : theme.text, fontFamily: 'Outfit_700Bold' }}>{p.name}</Text>
          </Pressable>
        ))}
      </View>
      {list.map((b) => (
        <Pressable key={b.id} onPress={() => setBouquetId(b.id)}>
          <Card style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{b.name}</Text>
            <Text style={{ color: theme.muted }}>{formatNaira(b.amount)} / {b.months} month</Text>
          </Card>
        </Pressable>
      ))}
      <Input label="Smartcard / IUC" value={iuc} onChangeText={setIuc} keyboardType="number-pad" />
      <Button label="Renew" onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`${bq?.name} · ${iuc}`} amount={bq?.amount ?? 0} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          await buyTv({ provider, iuc, amount: bq?.amount ?? 0, name: bq?.name, pin });
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Renewed', 'Subscription is active');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
