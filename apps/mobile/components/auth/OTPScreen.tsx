/**
 * OTP Verification Screen
 * OLED black themed OTP input for sign-in verification
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HapticPressable } from '@/components/ui';
import { InlineLoader } from '@/components/ui/loaders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body, Data, Supporting } from '@/components/ui';
import { onboardingStyles } from './onboarding-styles';

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
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === CODE_LENGTH && !isLoading) {
      onVerify(code);
    }
  }, [code, isLoading, onVerify]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

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

  const focusInput = () => {
    inputRef.current?.focus();
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
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [onboardingStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.oledWhite} />
            </HapticPressable>
            <View style={{ flex: 1 }} />
            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Supporting size="small" style={[onboardingStyles.greeting, { color: colors.primary }]}>
              Verify your email
            </Supporting>
            <Heading size="large" style={[onboardingStyles.title, { color: colors.oledWhite }]}>
              Enter the code
            </Heading>
            <Body size="small" style={[onboardingStyles.subtitle, { color: colors.textSecondary }]}>
              Sent to {email}
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

          {/* Code Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.codeSection}>
            <HapticPressable onPress={focusInput} style={onboardingStyles.codeBoxes}>
              {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                const digit = code[index] || '';
                const isActive = index === code.length;
                const isFilled = index < code.length;

                return (
                  <View
                    key={index}
                    style={[
                      onboardingStyles.codeBox,
                      {
                        backgroundColor: isFilled
                          ? `${colors.primary}15`
                          : `${colors.oledWhite}08`,
                        borderColor: error
                          ? colors.error
                          : isActive
                          ? colors.primary
                          : isFilled
                          ? colors.primary
                          : `${colors.oledWhite}15`,
                      },
                    ]}
                  >
                    <Heading size="medium" style={{ color: colors.oledWhite }}>
                      {digit}
                    </Heading>
                    {isActive && !isLoading && (
                      <Animated.View
                        entering={FadeIn.duration(150)}
                        style={[onboardingStyles.codeCursor, { backgroundColor: colors.primary }]}
                      />
                    )}
                  </View>
                );
              })}
            </HapticPressable>

            {/* Hidden input */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoFocus
              style={onboardingStyles.codeHiddenInput}
              editable={!isLoading}
            />
          </Animated.View>

          {/* Loading */}
          {isLoading && (
            <Animated.View
              entering={FadeIn.duration(150)}
              style={{ alignItems: 'center', marginTop: Spacing['2xl'] }}
            >
              <InlineLoader size="sm" />
            </Animated.View>
          )}

          {/* Resend & Help */}
          <View style={onboardingStyles.buttonSection}>
            {/* Resend */}
            <Animated.View entering={FadeIn.delay(300).duration(300)} style={onboardingStyles.resendSection}>
              {canResend ? (
                <HapticPressable onPress={handleResend} disabled={isLoading}>
                  <Data size="small" style={{ color: colors.primary }}>
                    Resend code
                  </Data>
                </HapticPressable>
              ) : (
                <Supporting size="small" style={{ color: colors.textTertiary }}>
                  Resend in {resendTimer}s
                </Supporting>
              )}
            </Animated.View>

            {/* Help text */}
            <Animated.View entering={FadeIn.delay(400).duration(300)}>
              <Supporting size="mini" style={[onboardingStyles.helpText, { color: colors.textTertiary }]}>
                Check your spam folder if you don't see it
              </Supporting>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
