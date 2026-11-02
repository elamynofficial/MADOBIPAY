import { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/src/context/WalletContext';
import { formatNaira } from '@/src/lib/format';
import { fundWallet, verifyFund } from '@/src/services/api/wallet';
import * as Clipboard from 'expo-clipboard';

const amounts = ['1000', '2000', '5000', '10000', '20000', '50000'];
const methods = [
  { id: 'paystack', title: 'Paystack', body: 'Cards, bank transfer and USSD (live checkout)', icon: 'wallet-outline' as const },
  { id: 'transfer', title: 'Bank transfer', body: 'Pay into your MADOBIPAY account number', icon: 'business-outline' as const },
  { id: 'monnify', title: 'Monnify', body: 'Not connected yet — use Paystack', icon: 'card-outline' as const },
  { id: 'ussd', title: 'USSD', body: 'Dial *966*amount*account# from your bank SIM', icon: 'keypad-outline' as const },
];

function callbackUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/fund-wallet`;
  }
  return ExpoLinking.createURL('fund-wallet');
}

export default function FundWallet() {
  const { theme } = useTheme();
  const { va, wallet } = useWallet();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ reference?: string; trxref?: string }>();
  const [amount, setAmount] = useState('5000');
  const [method, setMethod] = useState('paystack');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const naira = Number(amount) || 0;

  useEffect(() => {
    const ref = (typeof params.reference === 'string' && params.reference) || (typeof params.trxref === 'string' && params.trxref);
    if (!ref) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const result = await verifyFund(ref);
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ['wallet'] });
        await queryClient.invalidateQueries({ queryKey: ['txns'] });
        const msg = result.status === 'success' ? 'Paystack payment verified. Wallet credited.' : `Payment status: ${result.status}`;
        setNotice(msg);
        Alert.alert('Wallet funding', msg);
      } catch (e) {
        if (!cancelled) {
          setNotice(e instanceof Error ? e.message : 'Could not verify payment');
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.reference, params.trxref, queryClient]);

  const continuePay = async () => {
    if (naira < 100) {
      setNotice('Minimum is ₦100. Enter an amount from ₦100 to ₦1,000,000.');
      Alert.alert('Minimum is ₦100', 'Enter an amount from ₦100 to ₦1,000,000.');
      return;
    }
    if (method === 'ussd') {
      setNotice(`Dial *966*${naira}*${va.accountNumber}# from your bank SIM.`);
      void Linking.openURL(`tel:${encodeURIComponent(`*966*${naira}*${va.accountNumber}#`)}`);
      return;
    }
    if (method === 'transfer') {
      setNotice(`Transfer ${formatNaira(naira)} to ${va.accountNumber} (${va.bankName}). Auto-credit needs Paystack.`);
      return;
    }
    if (method === 'monnify') {
      setNotice('Monnify is not connected. Choose Paystack.');
      Alert.alert('Monnify unavailable', 'Use Paystack to fund your wallet.');
      return;
    }
    setBusy(true);
    try {
      const init = await fundWallet(naira, 'paystack', callbackUrl());
      if (init.authorizationUrl) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.assign(init.authorizationUrl);
          return;
        }
        await Linking.openURL(init.authorizationUrl);
        const result = await verifyFund(init.reference);
        await queryClient.invalidateQueries({ queryKey: ['wallet'] });
        await queryClient.invalidateQueries({ queryKey: ['txns'] });
        const msg = result.status === 'success' ? 'Paystack payment verified. Wallet credited.' : 'Complete payment in the Paystack page, then return here.';
        setNotice(msg);
        Alert.alert('Paystack', msg);
      } else {
        setNotice('Paystack did not return a checkout URL.');
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Funding failed');
      Alert.alert('Funding failed', e instanceof Error ? e.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <PageHeader title="Fund wallet" />
      <Card>
        <Text style={{ color: theme.muted }}>Available</Text>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 22, color: theme.text }}>{formatNaira(wallet.available)}</Text>
      </Card>
      <Input label="Amount (NGN)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {amounts.map((a) => (
          <Pressable
            key={a}
            onPress={() => setAmount(a)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
              backgroundColor: amount === a ? theme.primary : theme.card,
            }}
          >
            <Text style={{ color: amount === a ? '#fff' : theme.text, fontFamily: 'Outfit_600SemiBold' }}>
              {formatNaira(Number(a))}
            </Text>
          </Pressable>
        ))}
      </View>
      {methods.map((m) => (
        <Pressable key={m.id} onPress={() => setMethod(m.id)}>
          <Card style={{ marginBottom: 8, borderWidth: method === m.id ? 1.5 : 0, borderColor: theme.primary }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Ionicons name={m.icon} size={22} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{m.title}</Text>
                <Text style={{ color: theme.muted }}>{m.body}</Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
      {method === 'transfer' ? (
        <Card>
          <Text style={{ color: theme.muted }}>{va.bankName}</Text>
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 22, color: theme.text }}>{va.accountNumber}</Text>
          <Text style={{ color: theme.muted, marginTop: 4 }}>{va.accountName}</Text>
          <Pressable onPress={() => Clipboard.setStringAsync(va.accountNumber)}>
            <Text style={{ color: theme.primary, marginTop: 8, fontFamily: 'Outfit_600SemiBold' }}>Copy account number</Text>
          </Pressable>
        </Card>
      ) : null}
      {notice ? <Text style={{ color: theme.primary, fontFamily: 'Outfit_500Medium', marginBottom: 8 }}>{notice}</Text> : null}
      <View style={{ height: 12 }} />
      <Button label={busy ? 'Please wait…' : `Pay ${formatNaira(naira || 0)}`} onPress={continuePay} disabled={busy} />
    </Screen>
  );
}
