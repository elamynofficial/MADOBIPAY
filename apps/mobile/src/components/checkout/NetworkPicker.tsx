import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NETWORKS } from '@/src/data/catalog';
import { useTheme } from '@/src/theme/ThemeContext';

export function NetworkPicker({ value, onChange }: { value?: string; onChange: (id: string) => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {NETWORKS.map((n) => {
        const active = value === n.id;
        return (
          <Pressable
            key={n.id}
            onPress={() => onChange(n.id)}
            style={[styles.chip, { borderColor: active ? n.color : theme.border, backgroundColor: active ? `${n.color}22` : theme.card }]}
          >
            <View style={[styles.dot, { backgroundColor: n.color }]} />
            <Text style={{ color: theme.text, fontFamily: 'Outfit_600SemiBold', fontSize: 12 }}>{n.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
