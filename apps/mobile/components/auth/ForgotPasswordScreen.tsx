import React, { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { Text } from '@/components/ui';

import {
  AuthErrorBanner,
  AuthField,
  AuthInlineLink,
  AuthPrimaryButton,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function ForgotPasswordScreen({
  onBack,
  onSubmit,
  isLoading = false,
  error,
  success = false,
}: ForgotPasswordScreenProps) {
  const inputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const isValid = isValidEmail(email);

  useEffect(() => {
    if (success) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [success]);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await onSubmit(email.toLowerCase().trim());
  };

  if (success) {
    return (
      <AuthScreenShell
        title="Check your email"
        subtitle="We sent a password reset link. Come back and sign in once you’ve updated it."
        eyebrow="Password reset"
        onBack={onBack}
      >
        <AuthSection>
          <AuthInlineLink label="Reset email" value={email} onPress={onBack} />
          <AuthPrimaryButton onPress={onBack}>
            Back to sign in
          </AuthPrimaryButton>
        </AuthSection>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell
      title="Reset your password"
      subtitle="Enter the email linked to your account and we’ll send you a secure reset link."
      eyebrow="Forgot password"
      onBack={onBack}
      footer={
        <Text variant="subhead" tone="secondary" style={{ textAlign: 'center' }}>
          Remembered it?{' '}
          <Text variant="subhead" tone="primary" onPress={onBack}>
            Sign in instead
          </Text>
        </Text>
      }
    >
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
          onSubmitEditing={handleSubmit}
        />
        <AuthPrimaryButton onPress={handleSubmit} disabled={!isValid} loading={isLoading}>
          Send reset link
        </AuthPrimaryButton>
      </AuthSection>
    </AuthScreenShell>
  );
}
