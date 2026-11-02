import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import { MotiView } from 'moti';

const items: { label: string; icon: keyof typeof Ionicons.glyphMap; href: string }[] = [
  { label: 'Airtime', icon: 'call', href: '/airtime' },
  { label: 'Data', icon: 'wifi', href: '/data' },
  { label: 'Electricity', icon: 'flash', href: '/electricity' },
  { label: 'TV', icon: 'tv', href: '/tv' },
  { label: 'Exam PIN', icon: 'school', href: '/exam-pins' },
  { label: 'Cards', icon: 'print', href: '/recharge-cards' },
  { label: 'Bulk SMS', icon: 'chatbubbles', href: '/bulk-sms' },
  { label: 'More', icon: 'grid', href: '/services' },
];

export function ServiceGrid() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <View style={styles.grid}>
      {items.map((it, i) => (
        <MotiView key={it.label} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 280, delay: i * 40 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push(it.href as never)} style={[styles.tile, { backgroundColor: theme.card }]}>
            <View style={[styles.icon, { backgroundColor: theme.bg }]}>
              <Ionicons name={it.icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.label, { color: theme.text }]}>{it.label}</Text>
          </Pressable>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: 76, alignItems: 'center', paddingVertical: 12, borderRadius: 18, marginBottom: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: 11, fontFamily: 'Outfit_500Medium' },
});
