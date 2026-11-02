import { useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';
import { secure } from '@/src/lib/storage';

export default function Security() {
  const { theme } = useTheme();
  const router = useRouter();
  const [bio, setBio] = useState(false);
  const [twofa, setTwofa] = useState(false);
  return (
    <Screen>
      <PageHeader title="Security" />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.text, fontFamily: 'Outfit_600SemiBold' }}>Biometrics</Text>
          <Switch value={bio} onValueChange={async (v) => {
            if (v) {
              const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable biometrics' });
              if (!r.success) return;
              await secure.setBio(true);
            }
            setBio(v);
          }} />
        </View>
      </Card>
      <Card style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.text, fontFamily: 'Outfit_600SemiBold' }}>Two-factor (OTP)</Text>
          <Switch value={twofa} onValueChange={setTwofa} />
        </View>
      </Card>
      <Button label="Change password" variant="ghost" onPress={() => router.push('/forgot-password')} />
      <Button label="Change PIN" variant="ghost" onPress={() => router.push('/change-pin')} />
      <Button label="Revoke other sessions" onPress={() => Alert.alert('Done', 'Other devices signed out')} />
    </Screen>
  );
}
