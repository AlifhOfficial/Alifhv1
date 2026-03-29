/**
 * Password Step - Third step of onboarding
 * Create a secure password
 */

import { Text, HapticPressable, ButtonLoader } from '@/components/ui';
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Sizes } from '@/constants/theme';
import { onboardingStyles } from './onboarding-styles';

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
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isValid = hasMinLength && hasLetter && hasNumber;

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (isValid && !isLoading) {
      onContinue(password);
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

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Text variant="bodySm" style={[onboardingStyles.greeting, { color: colors.primary }]} tone="secondary">
              Almost there, {userName}
            </Text>
            <Text variant="title" style={[onboardingStyles.title, { color: colors.white }]}>
              Create a password
            </Text>
            <Text variant="bodySm" style={[onboardingStyles.subtitle, { color: colors.labelSecondary }]}>
              Keep your account secure
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
                    : password.length > 0
                    ? isValid
                      ? colors.success
                      : `${colors.white}30`
                    : `${colors.white}15`,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[
                  onboardingStyles.inputInner,
                  onboardingStyles.passwordInputInner,
                  { color: colors.white },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.labelTertiary}
                keyboardAppearance="dark"
                secureTextEntry={!showPassword}
                autoComplete={Platform.OS === 'android' ? 'off' : 'new-password'}
                textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                passwordRules="minlength: 8; required: lower; required: digit;"
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              <HapticPressable
                onPress={() => setShowPassword(!showPassword)}
                style={onboardingStyles.showPasswordButton}
              >
                <Text variant="bodySm" style={{ color: colors.labelTertiary }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </HapticPressable>
            </View>

            {/* Password Requirements */}
            {password.length > 0 && (
              <Animated.View entering={FadeIn.duration(200)} style={onboardingStyles.requirementsContainer}>
                <PasswordRequirement met={hasMinLength} text="At least 8 characters" colors={colors} />
                <PasswordRequirement met={hasLetter} text="Contains a letter" colors={colors} />
                <PasswordRequirement met={hasNumber} text="Contains a number" colors={colors} />
              </Animated.View>
            )}
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
                  Create Account
                </Text>
              )}
            </HapticPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
  colors: typeof Colors.dark;
}

function PasswordRequirement({ met, text, colors }: PasswordRequirementProps) {
  return (
    <View style={onboardingStyles.requirementRow}>
      <View
        style={[
          onboardingStyles.requirementDot,
          { backgroundColor: met ? colors.success : colors.labelTertiary },
        ]}
      />
      <Text variant="bodySm" style={{ color: met ? colors.success : colors.labelTertiary }} tone="secondary">
        {text}
      </Text>
    </View>
  );
}
