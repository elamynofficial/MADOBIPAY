import { useState } from 'react';
import { Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';

export default function AgentRegister() {
  const router = useRouter();
  const { theme } = useTheme();
  const [biz, setBiz] = useState('Okeke Communications');
  const [address, setAddress] = useState('14 Bode Thomas, Surulere, Lagos');
  const [phone, setPhone] = useState('08031234567');
  const [bvn, setBvn] = useState('');

  const submit = () => {
    if (biz.trim().length < 3 || address.trim().length < 8) {
      Alert.alert('Missing details', 'Enter your shop name and a full street address.');
      return;
    }
    Alert.alert('Application received', 'A MADOBIPAY officer will verify your shop within 24 hours. You can already preview the agent dashboard.');
    router.push('/agent');
  };

  return (
    <Screen>
      <PageHeader title="Become an agent" />
      <Card>
        <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>Earn on every sale</Text>
        <Text style={{ color: theme.muted, marginTop: 6 }}>
          Agents keep ₦8–₦250 commission on airtime, data and bills. You need BVN, a shop address and ₦20,000 opening float.
        </Text>
      </Card>
      <Input label="Business name" value={biz} onChangeText={setBiz} />
      <Input label="Shop address" value={address} onChangeText={setAddress} />
      <Input label="Shop phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="BVN" value={bvn} onChangeText={setBvn} keyboardType="number-pad" maxLength={11} />
      <Button label="Submit application" onPress={submit} />
    </Screen>
  );
}
