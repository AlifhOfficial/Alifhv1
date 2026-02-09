/**
 * Onboarding Types
 */

export type OnboardingStep = 
  | 'intro'
  | 'name' 
  | 'email' 
  | 'password'
  | 'complete';

export interface OnboardingData {
  name: string;
  email: string;
  password: string;
}

export interface StepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}
