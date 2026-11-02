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

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().regex(/^0[7-9][0-1]\d{8}$/, 'Valid NG number'),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

export default function Register() {
  const { theme } = useTheme();
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { fullName: '', email: '', phone: '', password: '', referralCode: '' } });

  const onSubmit = handleSubmit(async (v) => {
    try {
      setLoading(true);
      await register(v);
      router.push({ pathname: '/verify-otp', params: { phone: v.phone } });
    } catch (e) {
      Alert.alert('Could not register', e instanceof Error ? e.message : 'Try again');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Screen>
      <Text style={{ fontSize: 30, fontFamily: 'Outfit_700Bold', color: theme.text, marginTop: 12 }}>Create account</Text>
      <Text style={{ color: theme.muted, marginBottom: 20, fontFamily: 'Outfit_400Regular' }}>Join millions paying smarter</Text>
      <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => <Input label="Full name" value={value} onChangeText={onChange} error={errors.fullName?.message} />} />
      <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} error={errors.email?.message} />} />
      <Controller control={control} name="phone" render={({ field: { onChange, value } }) => <Input label="Phone" keyboardType="phone-pad" value={value} onChangeText={onChange} error={errors.phone?.message} />} />
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Input label="Password" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} />} />
      <Controller control={control} name="referralCode" render={({ field: { onChange, value } }) => <Input label="Referral code (optional)" value={value} onChangeText={onChange} />} />
      <Button label="Send OTP" loading={loading} onPress={onSubmit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
        <Text style={{ color: theme.muted }}>Already have an account? </Text>
        <Pressable onPress={() => router.back()}><Text style={{ color: theme.primary, fontFamily: 'Outfit_700Bold' }}>Login</Text></Pressable>
      </View>
    </Screen>
  );
}
