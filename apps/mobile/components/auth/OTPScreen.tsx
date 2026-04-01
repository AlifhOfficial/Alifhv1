import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import {
  AuthErrorBanner,
  AuthPrimaryButton,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

interface OTPScreenProps {
  email: string;
  onBack: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const CODE_LENGTH = 6;

export function OTPScreen({
  email,
  onBack,
  onVerify,
  onResend,
  isLoading = false,
  error,
}: OTPScreenProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((value) => value - 1), 1000);
      return () => clearTimeout(timer);
    }

    setCanResend(true);
  }, [resendTimer]);

  useEffect(() => {
    if (code.length === CODE_LENGTH && !isLoading) {
      onVerify(code);
    }
  }, [code, isLoading, onVerify]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setCanResend(false);
    setResendTimer(60);
    setCode('');
    await onResend();
  };

  return (
    <AuthScreenShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${email}. This helps keep Revvup secure and free of abuse.`}
      eyebrow="Verify email"
      onBack={onBack}
    >
      <AuthErrorBanner error={error} />

      <AuthSection>
        <Text variant="subhead" tone="muted">
          Verification code
        </Text>

        <View style={styles.codeRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, index) => {
            const digit = code[index] || '';
            const isActive = index === code.length;
            const isFilled = index < code.length;

            return (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: isFilled ? colors.primaryMuted : colors.background,
                    borderColor: error
                      ? colors.error
                      : isActive || isFilled
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text variant="headline" style={{ color: colors.label }}>
                  {digit || ' '}
                </Text>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
          editable={!isLoading}
          style={styles.hiddenInput}
        />

        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={colors.labelSecondary} />
          </View>
        ) : null}

        <Text variant="subhead" tone="secondary">
          Check your spam folder if it does not arrive right away.
        </Text>

        <AuthPrimaryButton onPress={() => inputRef.current?.focus()}>
          Enter code manually
        </AuthPrimaryButton>

        <Button variant="ghost" size="medium" onPress={handleResend} disabled={!canResend || isLoading}>
          {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
        </Button>
      </AuthSection>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  codeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
