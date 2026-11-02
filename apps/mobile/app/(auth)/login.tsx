import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/src/components/ui/Screen';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { prefs } from '@/src/lib/storage';

const schema = z.object({
  identifier: z.string().min(5, 'Email or phone is required'),
  password: z.string().min(4, 'Password is required'),
});

export default function Login() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '08031234567', password: 'Secret123' },
  });

  const onSubmit = handleSubmit(async (v) => {
    try {
      setLoading(true);
      setFormError('');
      await login(v.identifier, v.password);
      await prefs.set('onboarded', '1');
      try {
        router.replace('/home');
      } catch {
        router.replace('/(main)/(tabs)/home');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Try again';
      setFormError(msg);
      Alert.alert('Login failed', msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen>
      <Text style={{ fontSize: 32, fontFamily: 'Outfit_700Bold', color: theme.text, marginTop: 24 }}>Welcome back</Text>
      <Text style={{ color: theme.muted, marginBottom: 8, fontFamily: 'Outfit_400Regular' }}>Sign in to MADOBIPAY</Text>
      <Text style={{ color: theme.muted, marginBottom: 20, fontFamily: 'Outfit_400Regular', fontSize: 13 }}>
        Demo: 08031234567 · Secret123
      </Text>
      <Controller control={control} name="identifier" render={({ field: { onChange, value } }) => (
        <Input label="Email or phone" value={value} onChangeText={onChange} autoCapitalize="none" error={errors.identifier?.message} />
      )} />
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
      )} />
      <Pressable onPress={() => router.push('/forgot-password')}>
        <Text style={{ color: theme.primary, textAlign: 'right', marginBottom: 16, fontFamily: 'Outfit_600SemiBold' }}>Forgot password?</Text>
      </Pressable>
      {formError ? <Text style={{ color: theme.danger, marginBottom: 8, fontFamily: 'Outfit_500Medium' }}>{formError}</Text> : null}
      <Button label="Login" loading={loading} onPress={onSubmit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
        <Text style={{ color: theme.muted, fontFamily: 'Outfit_400Regular' }}>New here? </Text>
        <Pressable onPress={() => router.push('/register')}>
          <Text style={{ color: theme.primary, fontFamily: 'Outfit_700Bold' }}>Create account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
