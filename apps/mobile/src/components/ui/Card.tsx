import { StyleSheet, View, type ViewProps } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '@/src/theme/ThemeContext';

export function Card({ children, style, delay = 0, ...rest }: ViewProps & { delay?: number }) {
  const { theme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'timing', duration: 420, delay }}
      style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.text }, style]}
      {...rest}
    >
      <View>{children}</View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
