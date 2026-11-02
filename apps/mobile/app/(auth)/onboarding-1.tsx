import { OnboardSlide } from '@/src/components/auth/OnboardSlide';

export default function Onboarding1() {
  return (
    <OnboardSlide
      title="Buy airtime & data in seconds"
      body="Top up MTN, Airtel, Glo and 9mobile for yourself or anyone in Nigeria — instantly, 24/7."
      next="/onboarding-2"
    />
  );
}
