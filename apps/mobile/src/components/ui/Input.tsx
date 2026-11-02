import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

type Props = TextInputProps & { label: string; error?: string };

export function Input({ label, error, ...rest }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          { backgroundColor: theme.bg, color: theme.text, borderColor: error ? theme.danger : theme.border },
        ]}
        {...rest}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6, fontFamily: 'Outfit_500Medium' },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
  },
  err: { color: '#EF4444', marginTop: 4, fontSize: 12, fontFamily: 'Outfit_400Regular' },
});
