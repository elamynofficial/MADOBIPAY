import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { NetworkPicker } from '@/src/components/checkout/NetworkPicker';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { dataPlans } from '@/src/services/mock/store';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { formatNaira } from '@/src/lib/format';
import { buyData } from '@/src/services/api/vtu';

const types = ['sme', 'corporate', 'direct'] as const;

export default function Data() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [network, setNetwork] = useState('mtn');
  const [type, setType] = useState<(typeof types)[number]>('sme');
  const [planId, setPlanId] = useState<string>();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [open, setOpen] = useState(false);
  const plans = useMemo(() => dataPlans.filter((p) => p.network === network && p.type === type), [network, type]);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  return (
    <Screen>
      <PageHeader title="Buy data" />
      <NetworkPicker value={network} onChange={setNetwork} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {types.map((t) => (
          <Pressable key={t} onPress={() => setType(t)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: type === t ? theme.primary : theme.card }}>
            <Text style={{ color: type === t ? '#fff' : theme.text, fontFamily: 'Outfit_600SemiBold', textTransform: 'uppercase', fontSize: 12 }}>{t}</Text>
          </Pressable>
        ))}
      </View>
      {plans.map((p) => (
        <Pressable key={p.id} onPress={() => setPlanId(p.id)}>
          <Card style={{ marginBottom: 8, borderWidth: plan?.id === p.id ? 1.5 : 0, borderColor: theme.primary }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{p.name}</Text>
            <Text style={{ color: theme.muted }}>{p.validity} · {formatNaira(p.amount)}</Text>
          </Card>
        </Pressable>
      ))}
      <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button label="Continue" onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`${plan?.name} to ${phone}`} amount={plan?.amount ?? 0} onClose={() => setOpen(false)} onConfirm={async (pin) => {
        try {
          await buyData({ network, phone, amount: plan?.amount ?? 0, name: plan?.name, planId: plan?.id, pin });
          setOpen(false);
          await queryClient.invalidateQueries({ queryKey: ['txns'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet'] });
          Alert.alert('Success', 'Data is on the way');
          router.replace('/history');
        } catch (e) {
          Alert.alert('Failed', e instanceof Error ? e.message : 'Try again');
        }
      }} />
    </Screen>
  );
}
