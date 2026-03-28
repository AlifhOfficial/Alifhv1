/**
 * Email Sent Step - Confirmation that verification email was sent
 * Bridge between account creation and OTP entry
 */

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Sizes, Radius } from '@/constants/theme';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { Heading, Body, Data, ButtonText, Supporting } from '@/components/ui';
import { onboardingStyles, ONBOARDING_LAYOUT } from './onboarding-styles';

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

// Mail icon for success state
function MailIcon({ color, size = Sizes.bubble }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Checkmark icon
function CheckIcon({ color, size = Sizes.iconMd }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
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
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();

  const [isResending, setIsResending] = React.useState(false);

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
    <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
      <View
        style={[
          onboardingStyles.content,
          { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
      >
        {/* Header with progress */}
        <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
          <HapticPressable
            onPress={onBack}
            style={({ pressed }) => [onboardingStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="chevron-back" size={Sizes.iconLg} color={colors.white} />
          </HapticPressable>

          <View style={onboardingStyles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  onboardingStyles.progressBar,
                  {
                    backgroundColor:
                      index < currentStep ? colors.primary : colors.glassBorderDark,
                  },
                ]}
              />
            ))}
          </View>

          <View style={onboardingStyles.skipButton} />
        </Animated.View>

        {/* Center Content */}
        <View style={onboardingStyles.centerContent}>
          {/* Email Icon with check badge */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={onboardingStyles.iconContainer}>
            <View
              style={[
                onboardingStyles.emailSentIcon,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <MailIcon color={colors.primary} size={ONBOARDING_LAYOUT.emailIconSize} />
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Heading size="title" style={[onboardingStyles.welcomeTitle, { color: colors.white }]}>
              Check your inbox
            </Heading>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Body size="bodySm" style={[onboardingStyles.welcomeSubtitle, { color: colors.text2 }]}>
              We've sent a verification code to
            </Body>
          </Animated.View>

          {/* Email highlight */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={[onboardingStyles.emailHighlight, { backgroundColor: `${colors.white}08` }]}
          >
            <Data size="bodySm" style={{ color: colors.white }}>
              {email}
            </Data>
          </Animated.View>
        </View>

        {/* Buttons */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)} style={onboardingStyles.buttonSection}>
          <HapticPressable
            onPress={onContinue}
            disabled={isLoading}
            style={({ pressed }) => [
              onboardingStyles.continueButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ButtonLoader size="sm" variant="white" />
            ) : (
              <ButtonText style={{ color: colors.primaryFg }}>Enter Code</ButtonText>
            )}
          </HapticPressable>

          {/* Resend link */}
          <View style={onboardingStyles.resendSection}>
            <HapticPressable onPress={handleResend} disabled={isResending || isLoading}>
              <Body size="bodySm" style={{ color: colors.text2 }}>
                Didn't receive it?{' '}
                <Body size="bodySm" style={{ color: colors.primary }}>
                  {isResending ? 'Sending...' : 'Resend'}
                </Body>
              </Body>
            </HapticPressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
