import React, { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import {
  AuthErrorBanner,
  AuthField,
  AuthPrimaryButton,
  AuthProgress,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface EmailStepProps {
  userName: string;
  onContinue: (email: string) => void;
  onBack: () => void;
  initialEmail?: string;
  isLoading?: boolean;
  error?: string | null;
  currentStep: number;
  totalSteps: number;
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function EmailStep({
  userName,
  onContinue,
  onBack,
  initialEmail = '',
  isLoading = false,
  error,
  currentStep,
  totalSteps,
}: EmailStepProps) {
  const inputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState(initialEmail);
  const isValid = isValidEmail(email);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!isValid || isLoading) return;
    onContinue(email.toLowerCase().trim());
  };

  return (
    <AuthScreenShell
      title="Where should we reach you?"
      subtitle={`Nice to meet you, ${userName}. We’ll use your email for sign in, verification, and important updates.`}
      eyebrow="Create account"
      onBack={onBack}
    >
      <AuthProgress currentStep={currentStep} totalSteps={totalSteps} />
      <AuthErrorBanner error={error} />

      <AuthSection>
        <AuthField
          ref={inputRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
        <AuthPrimaryButton onPress={handleContinue} disabled={!isValid} loading={isLoading}>
          Continue
        </AuthPrimaryButton>
      </AuthSection>
    </AuthScreenShell>
  );
}
