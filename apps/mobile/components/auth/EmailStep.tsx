/**
 * Email Step - Second step of onboarding
 * Collect user's email address
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { Heading, Body, Data, ButtonText, Supporting } from '@/components/ui';
import { onboardingStyles } from './onboarding-styles';

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

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState(initialEmail);
  const isValid = isValidEmail(email);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isValid && !isLoading) {
      onContinue(email.toLowerCase().trim());
    }
  };

  return (
    <View style={[onboardingStyles.container, { backgroundColor: colors.oledBlack }]}>
      <KeyboardAvoidingView behavior="padding" style={onboardingStyles.keyboardView}>
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
              <Ionicons name="chevron-back" size={24} color={colors.oledWhite} />
            </HapticPressable>

            <View style={onboardingStyles.progressContainer}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    onboardingStyles.progressBar,
                    {
                      backgroundColor:
                        index < currentStep ? colors.primary : `${colors.oledWhite}20`,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section - Personalized */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Supporting size="small" style={[onboardingStyles.greeting, { color: colors.primary }]}>
              Nice to meet you, {userName}
            </Supporting>
            <Heading size="large" style={[onboardingStyles.title, { color: colors.oledWhite }]}>
              What's your email?
            </Heading>
            <Body size="small" style={[onboardingStyles.subtitle, { color: colors.textSecondary }]}>
              We'll send you a code to verify
            </Body>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[onboardingStyles.errorContainer, { backgroundColor: colors.errorMuted }]}
            >
              <Body size="small" tone="error" style={onboardingStyles.errorText}>
                {error}
              </Body>
            </Animated.View>
          )}

          {/* Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.inputSection}>
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.oledWhite}08`,
                  borderColor: error
                    ? colors.error
                    : email.length > 0
                    ? isValid
                      ? colors.primary
                      : `${colors.oledWhite}30`
                    : `${colors.oledWhite}15`,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[onboardingStyles.inputInner, { color: colors.oledWhite }]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={handleContinue}
              />
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={onboardingStyles.buttonSection}>
            <HapticPressable
              onPress={handleContinue}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                onboardingStyles.continueButton,
                {
                  backgroundColor: isValid ? colors.primary : `${colors.oledWhite}10`,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <ButtonText style={{ color: isValid ? colors.primaryForeground : colors.textTertiary }}>
                  Continue
                </ButtonText>
              )}
            </HapticPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
