import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

export default function VerifyOtp() {
  const { theme } = useTheme();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    try {
      setLoading(true);
      await verifyOtp(otp);
      router.replace('/create-pin');
    } catch (e) {
      Alert.alert('Invalid OTP', e instanceof Error ? e.message : 'Use the 6-digit SMS code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text, marginTop: 16 }}>Verify OTP</Text>
      <Text style={{ color: theme.muted, marginBottom: 20 }}>We sent a 6-digit code to {phone ?? 'your phone'}. Demo code: 123456</Text>
      <Input label="OTP" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />
      <Button label="Verify" loading={loading} onPress={go} />
    </Screen>
  );
}
