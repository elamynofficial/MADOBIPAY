import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/src/theme/tokens';

function goOnboarding(router: ReturnType<typeof useRouter>) {
  const hrefs = ['/(auth)/onboarding-1', '/onboarding-1'] as const;
  for (const href of hrefs) {
    try {
      router.replace(href);
      return;
    } catch {
      /* try next */
    }
  }
}

export default function Index() {
  const router = useRouter();

  return (
    <>
      <Redirect href="/(auth)/onboarding-1" />
      <LinearGradient colors={[palette.orange, palette.red, '#7F1D1D']} style={styles.box}>
        <Text style={styles.mark}>M</Text>
        <Text style={styles.name}>MADOBIPAY</Text>
        <Text style={styles.tag}>Fast, Secure & Reliable Digital Payments</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => goOnboarding(router)}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  mark: {
    color: '#fff',
    fontSize: 64,
    fontFamily: 'Outfit_700Bold',
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 96,
    height: 96,
    textAlign: 'center',
    lineHeight: 96,
    borderRadius: 28,
    overflow: 'hidden',
  },
  name: { color: '#fff', fontSize: 28, fontFamily: 'Outfit_700Bold', marginTop: 18, letterSpacing: 1 },
  tag: { color: 'rgba(255,255,255,0.9)', marginTop: 8, fontFamily: 'Outfit_400Regular', textAlign: 'center' },
  cta: {
    marginTop: 36,
    backgroundColor: '#fff',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaText: { color: palette.orange, fontSize: 16, fontFamily: 'Outfit_700Bold' },
});
