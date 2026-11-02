import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';

export default function Notifications() {
  const { theme } = useTheme();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const Row = ({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) => (
    <Card style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{label}</Text>
        <Switch value={value} onValueChange={set} />
      </View>
    </Card>
  );
  return (
    <Screen>
      <PageHeader title="Notifications" />
      <Row label="Push notifications (FCM)" value={push} set={setPush} />
      <Row label="Email notifications" value={email} set={setEmail} />
      <Row label="SMS notifications" value={sms} set={setSms} />
    </Screen>
  );
}
