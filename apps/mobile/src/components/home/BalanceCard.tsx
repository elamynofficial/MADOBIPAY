import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatNaira } from '@/src/lib/format';
import { useWallet } from '@/src/context/WalletContext';
import { palette } from '@/src/theme/tokens';

const actions = [
  { label: 'Fund', icon: 'add-circle-outline' as const, href: '/fund-wallet' },
  { label: 'Transfer', icon: 'swap-horizontal-outline' as const, href: '/transfer' },
  { label: 'Withdraw', icon: 'arrow-up-circle-outline' as const, href: '/withdraw' },
];

export function BalanceCard() {
  const { wallet, hidden, toggleHidden } = useWallet();
  const router = useRouter();
  return (
    <LinearGradient colors={[palette.orange, palette.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Wallet balance</Text>
        <Pressable onPress={toggleHidden} hitSlop={12}>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.amount}>{formatNaira(wallet.available, hidden)}</Text>
      <View style={styles.row}>
        <Text style={styles.sub}>Cashback {formatNaira(wallet.cashback, hidden)}</Text>
        <Text style={styles.sub}>Referral {formatNaira(wallet.referral, hidden)}</Text>
      </View>
      <View style={styles.actions}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={() => router.push(a.href as never)} style={styles.action}>
            <Ionicons name={a.icon} size={18} color="#fff" />
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Outfit_500Medium' },
  amount: { color: '#fff', fontSize: 32, fontFamily: 'Outfit_700Bold', marginVertical: 8 },
  sub: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Outfit_400Regular', fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  action: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: { color: '#fff', fontFamily: 'Outfit_600SemiBold', fontSize: 12 },
});
