import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function MainLayout() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="airtime" />
      <Stack.Screen name="data" />
      <Stack.Screen name="electricity" />
      <Stack.Screen name="tv" />
      <Stack.Screen name="exam-pins" />
      <Stack.Screen name="recharge-cards" />
      <Stack.Screen name="bulk-sms" />
      <Stack.Screen name="fund-wallet" />
      <Stack.Screen name="virtual-account" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="withdraw" />
      <Stack.Screen name="transaction/[id]" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="security" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="support" />
      <Stack.Screen name="referral" />
      <Stack.Screen name="cashback" />
      <Stack.Screen name="agent" />
    </Stack>
  );
}
