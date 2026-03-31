import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { ConfettiBurst, type ConfettiBurstRef, Text } from '@/components/ui';
import { Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { AuthPrimaryButton, AuthScreenShell, AuthSection } from './auth-theme';

interface AuthSuccessScreenProps {
  userName?: string;
  onContinue: () => void;
  autoRedirectDelay?: number;
}

export function AuthSuccessScreen({
  userName,
  onContinue,
  autoRedirectDelay,
}: AuthSuccessScreenProps) {
  const { colors } = useTheme();
  const confettiRef = useRef<ConfettiBurstRef>(null);

  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      confettiRef.current?.fire();
    }, 250);

    if (!autoRedirectDelay) {
      return () => clearTimeout(confettiTimer);
    }

    const redirectTimer = setTimeout(onContinue, autoRedirectDelay);
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(redirectTimer);
    };
  }, [autoRedirectDelay, onContinue]);

  const firstName = userName?.split(' ')[0];

  return (
    <AuthScreenShell
      title={firstName ? `Welcome to Revvup, ${firstName}` : 'Welcome to Revvup'}
      subtitle="Your account is ready. You can now browse cars, list for free, and manage buyer requests."
      eyebrow="Success"
      scrollable={false}
      keyboard={false}
    >
      <ConfettiBurst ref={confettiRef} />
      <AuthSection style={{ alignItems: 'center', marginTop: Spacing['3xl'] }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.successMuted,
          }}
        >
          <CheckCircle2 size={Sizes.iconXl} color={colors.success} strokeWidth={2.2} />
        </View>
        <Text variant="title3Emphasized" style={{ color: colors.label, textAlign: 'center' }}>
          Ready to get started?
        </Text>
        <Text variant="subhead" tone="secondary" style={{ textAlign: 'center' }}>
          Your messages, profile, and listing actions are now available.
        </Text>
        <AuthPrimaryButton onPress={onContinue}>
          Continue
        </AuthPrimaryButton>
      </AuthSection>
    </AuthScreenShell>
  );
}
