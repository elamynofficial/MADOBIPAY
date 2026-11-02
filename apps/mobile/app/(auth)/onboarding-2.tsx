import { OnboardSlide } from '@/src/components/auth/OnboardSlide';

export default function Onboarding2() {
  return (
    <OnboardSlide
      title="Pay bills without queues"
      body="Electricity, DStv, GOtv, exam pins and more. Verify meters, get tokens, and keep receipts."
      next="/onboarding-3"
    />
  );
}
