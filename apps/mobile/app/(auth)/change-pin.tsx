import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { PinPad } from '@/src/components/ui/PinPad';
import { Button } from '@/src/components/ui/Button';
import { secure } from '@/src/lib/storage';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ChangePin() {
  const { theme } = useTheme();
  const router = useRouter();
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(0);

  const go = async () => {
    if (step === 0) {
      const saved = await secure.getPin();
      if (saved && saved !== oldPin) return Alert.alert('Wrong PIN');
      setStep(1);
      return;
    }
    if (pin.length === 4) {
      await secure.setPin(pin);
      Alert.alert('PIN updated');
      router.back();
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 26, fontFamily: 'Outfit_700Bold', color: theme.text }}>{step === 0 ? 'Current PIN' : 'New PIN'}</Text>
      <PinPad value={step === 0 ? oldPin : pin} onChange={step === 0 ? setOldPin : setPin} />
      <Button label="Continue" onPress={go} />
    </Screen>
  );
}
