/**
 * Forgot Password Screen
 * OLED black themed password reset
 */

import { Text, HapticPressable, ButtonLoader } from '@/components/ui';
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Sizes } from '@/constants/theme';
import { onboardingStyles } from './onboarding-styles';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

// Check icon for success state
function CheckIcon({ color, size = Sizes.bubble }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} opacity={0.3} />
      <Path
        d="M8 12L11 15L16 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function ForgotPasswordScreen({
  onBack,
  onSubmit,
  isLoading = false,
  error,
  success = false,
}: ForgotPasswordScreenProps) {
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const isValid = isValidEmail(email);

  useEffect(() => {
    if (!success) {
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await onSubmit(email.toLowerCase().trim());
  };

  // Success state
  if (success) {
    return (
      <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
        <View
          style={[
            onboardingStyles.content,
            { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [onboardingStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="chevron-back" size={Sizes.iconLg} color={colors.white} />
            </HapticPressable>
            <View style={{ flex: 1 }} />
            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Center Content */}
          <View style={onboardingStyles.centerContent}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={onboardingStyles.iconContainer}>
              <View
                style={[
                  onboardingStyles.emailSentIcon,
                  { backgroundColor: `${colors.success}15` },
                ]}
              >
                <CheckIcon color={colors.success} size={Sizes.bubble} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Text variant="title" style={[onboardingStyles.welcomeTitle, { color: colors.white }]}>
                Check your email
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text variant="bodySm" style={[onboardingStyles.welcomeSubtitle, { color: colors.labelSecondary }]}>
                We've sent a reset link to
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              style={[onboardingStyles.emailHighlight, { backgroundColor: `${colors.white}08` }]}
            >
              <Text variant="bodySm" style={{ color: colors.white }}>
                {email}
              </Text>
            </Animated.View>
          </View>

          {/* Back Button */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={onboardingStyles.buttonSection}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [
                onboardingStyles.continueButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={{ color: colors.primaryForeground }} variant="body">Back to Sign In</Text>
            </HapticPressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[onboardingStyles.container, { backgroundColor: colors.black }]}>
      <KeyboardAvoidingView behavior="padding" style={onboardingStyles.keyboardView}>
        <View
          style={[
            onboardingStyles.content,
            { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
          ]}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [onboardingStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="chevron-back" size={Sizes.iconLg} color={colors.white} />
            </HapticPressable>
            <View style={{ flex: 1 }} />
            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Text variant="bodySm" style={[onboardingStyles.greeting, { color: colors.primary }]} tone="secondary">
              Forgot password?
            </Text>
            <Text variant="title" style={[onboardingStyles.title, { color: colors.white }]}>
              Reset your password
            </Text>
            <Text variant="bodySm" style={[onboardingStyles.subtitle, { color: colors.labelSecondary }]}>
              We'll send you a reset link
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
                  borderColor: email.length > 0
                    ? isValid ? colors.primary : `${colors.white}30`
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
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={onboardingStyles.buttonSection}>
            <HapticPressable
              onPress={handleSubmit}
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
                  Send Reset Link
                </Text>
              )}
            </HapticPressable>

            {/* Back to sign in */}
            <Animated.View entering={FadeIn.delay(400).duration(300)} style={onboardingStyles.footer}>
              <Text variant="bodySm" style={{ color: colors.labelSecondary }}>
                Remember your password?{' '}
              </Text>
              <HapticPressable onPress={onBack}>
                <Text variant="bodySm" style={{ color: colors.primary }}>Sign in</Text>
              </HapticPressable>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
