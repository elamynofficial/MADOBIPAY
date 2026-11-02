import { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { Screen } from '@/src/components/ui/Screen';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { ConfirmSheet } from '@/src/components/checkout/ConfirmSheet';
import { EXAMS } from '@/src/data/catalog';
import { formatNaira } from '@/src/lib/format';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ExamPins() {
  const { theme } = useTheme();
  const [id, setId] = useState('waec');
  const [open, setOpen] = useState(false);
  const exam = EXAMS.find((e) => e.id === id)!;
  return (
    <Screen>
      <PageHeader title="Exam PINs" />
      {EXAMS.map((e) => (
        <Pressable key={e.id} onPress={() => setId(e.id)}>
          <Card style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>{e.name}</Text>
            <Text style={{ color: theme.muted }}>{formatNaira(e.amount)}</Text>
          </Card>
        </Pressable>
      ))}
      <Button label={`Buy ${exam.name} PIN`} onPress={() => setOpen(true)} />
      <ConfirmSheet open={open} title={`${exam.name} result checker`} amount={exam.amount} onClose={() => setOpen(false)} onConfirm={() => { setOpen(false); Alert.alert('PIN', 'WAEC-8821-3301-4490'); }} />
    </Screen>
  );
}
