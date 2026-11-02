import { Modal, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { PinPad } from '@/src/components/ui/PinPad';
import { Button } from '@/src/components/ui/Button';
import { useTheme } from '@/src/theme/ThemeContext';
import { formatNaira } from '@/src/lib/format';

export function ConfirmSheet({
  open,
  title,
  amount,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  amount: number;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}) {
  const { theme } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
    }
  }, [open]);

  const pay = () => {
    if (pin.length < 4) {
      setError('Enter your 4-digit PIN');
      return;
    }
    onConfirm(pin);
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={[styles.h, { color: theme.text }]}>Confirm payment</Text>
          <Text style={{ color: theme.muted, textAlign: 'center', fontFamily: 'Outfit_400Regular' }}>{title}</Text>
          <Text style={[styles.amt, { color: theme.text }]}>{formatNaira(amount)}</Text>
          <PinPad value={pin} onChange={(v) => { setError(''); setPin(v); }} />
          {error ? <Text style={{ color: theme.danger, textAlign: 'center', marginBottom: 8 }}>{error}</Text> : null}
          <Text style={{ color: theme.muted, textAlign: 'center', marginBottom: 8, fontSize: 12 }}>Demo PIN: 1234</Text>
          <Button label="Pay now" onPress={pay} />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  h: { fontSize: 20, fontFamily: 'Outfit_700Bold', textAlign: 'center' },
  amt: { fontSize: 28, fontFamily: 'Outfit_700Bold', textAlign: 'center', marginVertical: 12 },
});
