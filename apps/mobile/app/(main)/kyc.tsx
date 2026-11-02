import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';
import { palette } from '@/src/theme/tokens';

const levels = [
  { level: 1, title: 'Level 1 · Phone', limit: '₦50,000 / day', done: true },
  { level: 2, title: 'Level 2 · BVN + NIN', limit: '₦200,000 / day', done: false },
  { level: 3, title: 'Level 3 · ID + selfie', limit: '₦1,000,000 / day', done: false },
];

export default function Kyc() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [idReady, setIdReady] = useState(false);
  const [selfieReady, setSelfieReady] = useState(false);

  const submit = () => {
    if (bvn.length !== 11 || nin.length !== 11) {
      Alert.alert('Incomplete', 'Enter an 11-digit BVN and NIN to reach Level 2.');
      return;
    }
    Alert.alert(
      'KYC submitted',
      'We will match your BVN/NIN with NIMC and notify you within 15 minutes. Level 3 needs a government ID and liveness selfie.',
    );
  };

  return (
    <Screen>
      <PageHeader title="KYC verification" />
      <Card>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: theme.text }}>
          {user?.fullName ?? 'Customer'} · Level {user?.kycLevel ?? 1}
        </Text>
        <Text style={{ color: theme.muted, marginTop: 6 }}>
          Higher KYC unlocks bigger wallet funding, transfers and bill payments — same flow as Opay and PalmPay.
        </Text>
      </Card>
      {levels.map((l) => (
        <Card key={l.level} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons
              name={l.level <= (user?.kycLevel ?? 1) ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={l.level <= (user?.kycLevel ?? 1) ? palette.success : theme.muted}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{l.title}</Text>
              <Text style={{ color: theme.muted, fontSize: 12 }}>{l.limit}</Text>
            </View>
          </View>
        </Card>
      ))}
      <Text style={{ marginTop: 18, marginBottom: 8, fontFamily: 'Outfit_700Bold', color: theme.text }}>Upgrade to Level 2</Text>
      <Input label="BVN" value={bvn} onChangeText={setBvn} keyboardType="number-pad" maxLength={11} />
      <Input label="NIN" value={nin} onChangeText={setNin} keyboardType="number-pad" maxLength={11} />
      <Text style={{ marginTop: 8, marginBottom: 8, fontFamily: 'Outfit_700Bold', color: theme.text }}>Level 3 documents</Text>
      <Pressable onPress={() => { setIdReady(true); Alert.alert('ID captured', 'National ID / voter card queued for Cloudinary upload.'); }}>
        <Card style={{ marginBottom: 8 }}>
          <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>
            {idReady ? 'ID uploaded' : 'Upload government ID'}
          </Text>
          <Text style={{ color: theme.muted }}>NIN slip, voter card or international passport</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => { setSelfieReady(true); Alert.alert('Selfie captured', 'Liveness check passed. Ready to submit.'); }}>
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>
            {selfieReady ? 'Selfie verified' : 'Take liveness selfie'}
          </Text>
          <Text style={{ color: theme.muted }}>Look straight at the camera in good light</Text>
        </Card>
      </Pressable>
      <Button label="Submit KYC" onPress={submit} />
    </Screen>
  );
}
