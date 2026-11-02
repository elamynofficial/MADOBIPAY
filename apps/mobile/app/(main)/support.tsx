import { useState } from 'react';
import { Alert, Linking, Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme/ThemeContext';

export default function Support() {
  const { theme } = useTheme();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  return (
    <Screen>
      <PageHeader title="Support" />
      <Button label="WhatsApp support" onPress={() => Linking.openURL('https://wa.me/2348000000000')} />
      <Button label="Live chat" variant="ghost" onPress={() => Alert.alert('Live chat', 'Connecting you to an agent')} />
      <Card style={{ marginVertical: 12 }}><Text style={{ color: theme.muted }}>Open a ticket</Text></Card>
      <Input label="Subject" value={subject} onChangeText={setSubject} />
      <Input label="Message" value={body} onChangeText={setBody} multiline />
      <Button label="Submit ticket" onPress={() => Alert.alert('Ticket opened', 'We will reply within 15 minutes')} />
    </Screen>
  );
}
