import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { requestPasswordReset } from '@/src/services/api/auth';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text }}>Forgot password</Text>
      <Text style={{ color: theme.muted, marginVertical: 12 }}>Enter your email or phone. We’ll send a reset code.</Text>
      <Input label="Email or phone" value={id} onChangeText={setId} />
      <Button label="Send reset code" loading={loading} onPress={async () => {
        try { setLoading(true); await requestPasswordReset(id); router.push('/reset-password'); }
        catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Try again'); }
        finally { setLoading(false); }
      }} />
    </Screen>
  );
}
