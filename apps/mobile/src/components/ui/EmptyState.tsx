import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { Button } from './Button';

export function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name="receipt-outline" size={42} color={theme.muted} />
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{body}</Text>
      {action ? <View style={{ width: '70%', marginTop: 16 }}><Button label={action} onPress={onAction} /></View> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name="warning-outline" size={42} color={theme.danger} />
      <Text style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{message}</Text>
      {onRetry ? <View style={{ width: '70%', marginTop: 16 }}><Button label="Try again" onPress={onRetry} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 32, gap: 8 },
  title: { fontSize: 18, fontFamily: 'Outfit_700Bold', marginTop: 8 },
  body: { textAlign: 'center', fontFamily: 'Outfit_400Regular', lineHeight: 20 },
});
