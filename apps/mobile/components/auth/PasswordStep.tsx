import React, { useEffect, useRef, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { HapticPressable, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';

import {
  AuthErrorBanner,
  AuthField,
  AuthPrimaryButton,
  AuthProgress,
  AuthRequirement,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface PasswordStepProps {
  userName: string;
  onContinue: (password: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
  currentStep: number;
  totalSteps: number;
}

export function PasswordStep({
  userName,
  onContinue,
  onBack,
  isLoading = false,
  error,
  currentStep,
  totalSteps,
}: PasswordStepProps) {
  const inputRef = useRef<TextInput>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasMinLength && hasLetter && hasNumber;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!isValid || isLoading) return;
    onContinue(password);
  };

  return (
    <AuthScreenShell
      title="Protect your account"
      subtitle={`Last step, ${userName}. Choose a password so you can manage listings and buyer requests securely.`}
      eyebrow="Create account"
      onBack={onBack}
    >
      <AuthProgress currentStep={currentStep} totalSteps={totalSteps} />
      <AuthErrorBanner error={error} />

      <AuthSection>
        <AuthField
          ref={inputRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 characters"
          secureTextEntry={!showPassword}
          autoComplete={Platform.OS === 'android' ? 'off' : 'new-password'}
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
          passwordRules="minlength: 8; required: lower; required: digit;"
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          right={
            <HapticPressable onPress={() => setShowPassword((value) => !value)}>
              <Text variant="subhead" tone="secondary">
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </HapticPressable>
          }
        />

        <View style={{ gap: Spacing.sm }}>
          <AuthRequirement label="At least 8 characters" met={hasMinLength} />
          <AuthRequirement label="Contains a letter" met={hasLetter} />
          <AuthRequirement label="Contains a number" met={hasNumber} />
        </View>

        <AuthPrimaryButton onPress={handleContinue} disabled={!isValid} loading={isLoading}>
          Continue
        </AuthPrimaryButton>
      </AuthSection>
    </AuthScreenShell>
  );
}
