import React, { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import {
  AuthField,
  AuthPrimaryButton,
  AuthProgress,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface NameStepProps {
  onContinue: (name: string) => void;
  onBack: () => void;
  initialName?: string;
  isLoading?: boolean;
  currentStep: number;
  totalSteps: number;
}

export function NameStep({
  onContinue,
  onBack,
  initialName = '',
  isLoading = false,
  currentStep,
  totalSteps,
}: NameStepProps) {
  const inputRef = useRef<TextInput>(null);
  const [name, setName] = useState(initialName);
  const isValid = name.trim().length >= 2;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!isValid || isLoading) return;
    onContinue(name.trim());
  };

  return (
    <AuthScreenShell
      title="Let’s set up your account"
      subtitle="Start with your name so buyers and sellers know who they’re speaking with."
      eyebrow="Create account"
      onBack={onBack}
    >
      <AuthProgress currentStep={currentStep} totalSteps={totalSteps} />

      <AuthSection>
        <AuthField
          ref={inputRef}
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="name"
          textContentType="givenName"
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
