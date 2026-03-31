import React, { useState } from 'react';

import { Button, Text } from '@/components/ui';

import {
  AuthInlineLink,
  AuthPrimaryButton,
  AuthProgress,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface EmailSentStepProps {
  email: string;
  userName: string;
  onContinue: () => void;
  onBack: () => void;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  currentStep: number;
  totalSteps: number;
}

export function EmailSentStep({
  email,
  userName,
  onContinue,
  onBack,
  onResend,
  isLoading = false,
  currentStep,
  totalSteps,
}: EmailSentStepProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await onResend();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthScreenShell
      title="Check your inbox"
      subtitle={`We sent ${userName ? `${userName} ` : ''}a 6-digit code. Enter it to finish setting up your Revvup account.`}
      eyebrow="Verify email"
      onBack={onBack}
    >
      <AuthProgress currentStep={currentStep} totalSteps={totalSteps} />

      <AuthSection>
        <AuthInlineLink label="Verification email" value={email} onPress={onContinue} />
        <Text variant="subhead" tone="secondary">
          Open the code screen when you’re ready. If it does not show up, you can resend it below.
        </Text>
        <AuthPrimaryButton onPress={onContinue} loading={isLoading}>
          Enter code
        </AuthPrimaryButton>
        <Button variant="ghost" size="medium" onPress={handleResend} disabled={isResending || isLoading}>
          {isResending ? 'Sending again...' : 'Resend email'}
        </Button>
      </AuthSection>
    </AuthScreenShell>
  );
}
