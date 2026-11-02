import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';

export function PageHeader({ title }: { title: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: theme.card }]}>
        <Ionicons name="chevron-back" size={20} color={theme.text} />
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
});
