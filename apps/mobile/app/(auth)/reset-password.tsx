import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { resetPassword } from '@/src/services/api/auth';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ResetPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text }}>Reset password</Text>
      <Input label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
      <Input label="New password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label="Update password" loading={loading} onPress={async () => {
        try { setLoading(true); await resetPassword(otp, password); Alert.alert('Done', 'Password updated'); router.replace('/login'); }
        catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Try again'); }
        finally { setLoading(false); }
      }} />
    </Screen>
  );
}
