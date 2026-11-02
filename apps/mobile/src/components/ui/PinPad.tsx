import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/theme/ThemeContext';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinPad({ value, onChange, length = 4 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const { theme } = useTheme();
  const tap = (k: string) => {
    try {
      void Haptics.selectionAsync();
    } catch {
      /* web */
    }
    if (k === '⌫') onChange(value.slice(0, -1));
    else if (k && value.length < length) onChange(value + k);
  };
  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i < value.length ? theme.primary : theme.border }]} />
        ))}
      </View>
      <View style={styles.grid}>
        {KEYS.map((k, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={k === '⌫' ? 'Delete' : k || 'empty'}
            onPress={() => tap(k)}
            style={[styles.key, { backgroundColor: theme.card }]}
            disabled={!k}
          >
            <Text style={[styles.keyText, { color: theme.text }]} pointerEvents="none">{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  key: { width: 84, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 22, fontFamily: 'Outfit_600SemiBold' },
});
