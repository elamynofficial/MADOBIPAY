import { OnboardSlide } from '@/src/components/auth/OnboardSlide';

export default function Onboarding3() {
  return (
    <OnboardSlide
      title="Bank-grade security"
      body="Transaction PIN, OTP, biometrics and encrypted sessions keep every naira on MADOBIPAY safe."
      next="/login"
      last
    />
  );
}
