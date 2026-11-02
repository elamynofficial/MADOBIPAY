import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'onboarding-1',
};

export default function AuthLayout() {
  return (
    <Stack initialRouteName="onboarding-1" screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="onboarding-1" />
      <Stack.Screen name="onboarding-2" />
      <Stack.Screen name="onboarding-3" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="change-pin" />
    </Stack>
  );
}
