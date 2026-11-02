import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { palette } from '@/src/theme/tokens';
import { Button } from '@/src/components/ui/Button';
import { prefs } from '@/src/lib/storage';

export function OnboardSlide({
  title,
  body,
  next,
  last,
}: {
  title: string;
  body: string;
  next: string;
  last?: boolean;
}) {
  const router = useRouter();

  const goLogin = () => {
    try {
      void prefs.set('onboarded', '1');
    } catch {
      /* ignore */
    }
    try {
      router.replace('/(auth)/login');
    } catch {
      router.replace('/login');
    }
  };

  const go = () => {
    if (last) {
      goLogin();
      return;
    }
    try {
      router.push(next as never);
    } catch {
      router.push('/onboarding-2');
    }
  };

  return (
    <LinearGradient colors={['#FFF7ED', '#FFFFFF']} style={styles.box}>
      <Pressable accessibilityRole="button" onPress={goLogin}>
        <Text style={styles.skip}>Skip</Text>
      </Pressable>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.hero} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      <Button label={last ? 'Get started' : 'Continue'} onPress={go} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, padding: 24, paddingTop: 64, paddingBottom: 40 },
  skip: { textAlign: 'right', color: palette.orange, fontFamily: 'Outfit_600SemiBold' },
  hero: { height: 220, borderRadius: 32, backgroundColor: palette.yellow, marginBottom: 28, opacity: 0.9 },
  title: { fontSize: 30, fontFamily: 'Outfit_700Bold', color: palette.dark, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#475569', fontFamily: 'Outfit_400Regular', marginBottom: 24 },
});
