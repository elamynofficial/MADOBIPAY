import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { palette } from '@/src/theme/tokens';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
};

export function Button({ label, onPress, loading, variant = 'primary', disabled }: Props) {
  const press = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* web / Expo Go without haptics */
    }
    onPress?.();
  };
  if (variant === 'ghost') {
    return (
      <Pressable accessibilityRole="button" onPress={press} disabled={disabled || loading} style={styles.ghost}>
        <Text style={styles.ghostText}>{label}</Text>
      </Pressable>
    );
  }
  const colors = variant === 'danger' ? ([palette.danger, '#B91C1C'] as const) : ([palette.orange, palette.red] as const);
  return (
    <Pressable accessibilityRole="button" onPress={press} disabled={disabled || loading} style={styles.wrap}>
      <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, (disabled || loading) && { opacity: 0.6 }]}>
        {loading ? <ActivityIndicator color="#fff" pointerEvents="none" /> : <Text style={styles.text} pointerEvents="none">{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, overflow: 'hidden' },
  btn: { height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  text: { color: '#fff', fontSize: 16, fontFamily: 'Outfit_600SemiBold' },
  ghost: { height: 48, alignItems: 'center', justifyContent: 'center' },
  ghostText: { color: palette.orange, fontSize: 15, fontFamily: 'Outfit_600SemiBold' },
});
