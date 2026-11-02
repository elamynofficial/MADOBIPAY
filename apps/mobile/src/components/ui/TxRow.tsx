import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Transaction } from '@/src/types/models';
import { formatDate, formatNaira } from '@/src/lib/format';
import { palette } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/ThemeContext';

const icon: Record<string, keyof typeof Ionicons.glyphMap> = {
  airtime: 'call-outline',
  data: 'wifi-outline',
  electricity: 'flash-outline',
  tv: 'tv-outline',
  exam: 'school-outline',
  funding: 'arrow-down-outline',
  transfer: 'swap-horizontal-outline',
  withdrawal: 'arrow-up-outline',
};

export function TxRow({ item, onPress }: { item: Transaction; onPress?: () => void }) {
  const { theme } = useTheme();
  const credit = item.amount > 0;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon[item.service] ?? 'ellipse-outline'} size={18} color={theme.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>{item.subtitle} · {formatDate(item.createdAt)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.amt, { color: credit ? palette.success : theme.text }]}>
          {credit ? '+' : ''}{formatNaira(item.amount)}
        </Text>
        <Text style={{ color: item.status === 'success' ? palette.success : item.status === 'failed' ? palette.danger : palette.warning, fontSize: 11, fontFamily: 'Outfit_500Medium' }}>
          {item.status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  sub: { fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 2 },
  amt: { fontFamily: 'Outfit_700Bold', fontSize: 14 },
});
