import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { PinPad } from '@/src/components/ui/PinPad';
import { Button } from '@/src/components/ui/Button';
import { secure } from '@/src/lib/storage';
import { useTheme } from '@/src/theme/ThemeContext';

export default function CreatePin() {
  const { theme } = useTheme();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'set' | 'confirm'>('set');

  const next = async () => {
    if (stage === 'set') {
      if (pin.length !== 4) return;
      setStage('confirm');
      return;
    }
    if (pin !== confirm) {
      Alert.alert('PIN mismatch', 'Both PINs must match');
      setConfirm('');
      return;
    }
    await secure.setPin(pin);
    router.replace('/home');
  };

  return (
    <Screen scroll={false}>
      <Text style={{ fontSize: 26, fontFamily: 'Outfit_700Bold', color: theme.text, marginTop: 12 }}>
        {stage === 'set' ? 'Create transaction PIN' : 'Confirm PIN'}
      </Text>
      <Text style={{ color: theme.muted, marginBottom: 24 }}>Used to authorize airtime, bills and transfers.</Text>
      <PinPad value={stage === 'set' ? pin : confirm} onChange={stage === 'set' ? setPin : setConfirm} />
      <Button label={stage === 'set' ? 'Continue' : 'Save PIN'} onPress={next} />
    </Screen>
  );
}
