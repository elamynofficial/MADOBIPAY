import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/ui/Screen';
import { Card } from '@/src/components/ui/Card';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/theme/ThemeContext';

const rows = [
  { label: 'Edit profile', href: '/edit-profile', icon: 'person-outline' as const },
  { label: 'KYC verification', href: '/kyc', icon: 'shield-checkmark-outline' as const },
  { label: 'Security', href: '/security', icon: 'lock-closed-outline' as const },
  { label: 'Notifications', href: '/notifications', icon: 'notifications-outline' as const },
  { label: 'Support', href: '/support', icon: 'headset-outline' as const },
  { label: 'Referrals', href: '/referral', icon: 'gift-outline' as const },
  { label: 'Become an agent', href: '/agent/register', icon: 'briefcase-outline' as const },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const router = useRouter();
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontFamily: 'Outfit_700Bold', color: theme.text }}>Profile</Text>
      <Card style={{ marginVertical: 16, alignItems: 'center' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 28, fontFamily: 'Outfit_700Bold' }}>{user?.fullName?.[0] ?? 'M'}</Text>
        </View>
        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 18, color: theme.text, marginTop: 8 }}>{user?.fullName}</Text>
        <Text style={{ color: theme.muted }}>{user?.phone} · KYC L{user?.kycLevel}</Text>
      </Card>
      {rows.map((r) => (
        <Pressable key={r.label} onPress={() => router.push(r.href as never)}>
          <Card style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name={r.icon} size={20} color={theme.primary} />
              <Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>{r.label}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
      <Pressable onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
        <Card style={{ marginBottom: 8 }}><Text style={{ fontFamily: 'Outfit_600SemiBold', color: theme.text }}>Theme: {mode}</Text></Card>
      </Pressable>
      <Pressable onPress={() => Alert.alert('Sign out', 'End this session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout().then(() => router.replace('/login')) },
      ])}>
        <Card><Text style={{ color: theme.danger, fontFamily: 'Outfit_700Bold' }}>Logout</Text></Card>
      </Pressable>
    </Screen>
  );
}
