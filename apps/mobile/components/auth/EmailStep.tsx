/**
 * Email Step - Second step of onboarding
 * Collect user's email address
 */

import { Text, HapticPressable, ButtonLoader } from '@/components/ui';
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Sizes } from '@/constants/theme';
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
    <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
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
                        index < currentStep ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section - Personalized */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Text variant="bodySm" style={[onboardingStyles.greeting, { color: colors.primary }]} tone="secondary">
              Nice to meet you, {userName}
            </Text>
            <Text variant="title" style={[onboardingStyles.title, { color: colors.white }]}>
              What's your email?
            </Text>
            <Text variant="bodySm" style={[onboardingStyles.subtitle, { color: colors.labelSecondary }]}>
              We'll send you a code to verify
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[onboardingStyles.errorContainer, { backgroundColor: colors.errorMuted }]}
            >
              <Text variant="bodySm" tone="error" style={onboardingStyles.errorText}>
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.inputSection}>
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.white}08`,
                  borderColor: error
                    ? colors.error
                    : email.length > 0
                    ? isValid
                      ? colors.primary
                      : `${colors.white}30`
                    : `${colors.white}15`,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[onboardingStyles.inputInner, { color: colors.white }]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.labelTertiary}
                keyboardType="email-address"
                keyboardAppearance="dark"
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
                  backgroundColor: isValid ? colors.primary : `${colors.white}10`,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <Text style={{ color: isValid ? colors.primaryForeground : colors.labelTertiary }} variant="body">
                  Continue
                </Text>
              )}
            </HapticPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
