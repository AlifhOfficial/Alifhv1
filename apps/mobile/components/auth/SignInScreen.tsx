/**
 * Sign In Screen - Simple OLED black themed sign in
 * Matches the onboarding aesthetic
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { Heading, Body, Data, ButtonText, Supporting } from '@/components/ui';
import { onboardingStyles } from './onboarding-styles';

interface SignInScreenProps {
  onBack: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onAppleSignIn?: () => Promise<void>;
  onSwitchToSignUp: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function SignInScreen({
  onBack,
  onSignIn,
  onForgotPassword,
  onGoogleSignIn,
  onAppleSignIn,
  onSwitchToSignUp,
  isLoading = false,
  error,
}: SignInScreenProps) {
  const colors = Colors.dark; // OLED black theme
  const insets = useSafeAreaInsets();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = isValidEmail(email) && password.length >= 1;

  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await onSignIn(email.toLowerCase().trim(), password);
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
              Welcome back
            </Supporting>
            <Heading size="large" style={[onboardingStyles.title, { color: colors.oledWhite }]}>
              Sign in to continue
            </Heading>
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

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.inputSection}>
            {/* Email */}
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.oledWhite}08`,
                  borderColor: email.length > 0 
                    ? isValidEmail(email) ? colors.primary : `${colors.oledWhite}30`
                    : `${colors.oledWhite}15`,
                },
              ]}
            >
              <TextInput
                ref={emailRef}
                style={[onboardingStyles.inputInner, { color: colors.oledWhite }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
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
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Password */}
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.oledWhite}08`,
                  borderColor: password.length > 0 ? colors.primary : `${colors.oledWhite}15`,
                },
              ]}
            >
              <TextInput
                ref={passwordRef}
                style={[
                  onboardingStyles.inputInner,
                  onboardingStyles.passwordInputInner,
                  { color: colors.oledWhite },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                autoComplete={Platform.OS === 'android' ? 'off' : 'password'}
                textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                selectionColor={colors.primary}
                underlineColorAndroid="transparent"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <HapticPressable
                onPress={() => setShowPassword(!showPassword)}
                style={onboardingStyles.showPasswordButton}
              >
                <Data size="mini" style={{ color: colors.textTertiary }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Data>
              </HapticPressable>
            </View>

            {/* Forgot Password */}
            <HapticPressable
              onPress={onForgotPassword}
              style={{ alignSelf: 'flex-end', paddingVertical: Spacing.xs }}
            >
              <Data size="mini" style={{ color: colors.textSecondary }}>
                Forgot password?
              </Data>
            </HapticPressable>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={onboardingStyles.buttonSection}>
            {/* Sign In Button */}
            <HapticPressable
              onPress={handleSubmit}
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
                  Sign In
                </ButtonText>
              )}
            </HapticPressable>

            {/* Social Auth */}
            {(onGoogleSignIn || onAppleSignIn) && (
              <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.lg }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: `${colors.oledWhite}15` }} />
                  <Supporting size="small" style={{ color: colors.textTertiary }}>or</Supporting>
                  <View style={{ flex: 1, height: 1, backgroundColor: `${colors.oledWhite}15` }} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg }}>
                  {/* Apple */}
                  {onAppleSignIn && Platform.OS === 'ios' && (
                    <HapticPressable
                      onPress={onAppleSignIn}
                      disabled={isLoading}
                      style={({ pressed }) => [{
                        width: 56,
                        height: 56,
                        borderRadius: Radius.xl,
                        backgroundColor: colors.oledWhite,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1,
                      }]}
                    >
                      <Ionicons name="logo-apple" size={18} color={colors.oledBlack} />
                    </HapticPressable>
                  )}

                  {/* Google */}
                  {onGoogleSignIn && (
                    <HapticPressable
                      onPress={onGoogleSignIn}
                      disabled={isLoading}
                      style={({ pressed }) => [{
                        width: 56,
                        height: 56,
                        borderRadius: Radius.xl,
                        backgroundColor: `${colors.oledWhite}08`,
                        borderWidth: 1,
                        borderColor: `${colors.oledWhite}15`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1,
                      }]}
                    >
                      <Ionicons name="logo-google" size={20} color={colors.oledWhite} />
                    </HapticPressable>
                  )}
                </View>
              </View>
            )}

            {/* Switch to Sign Up */}
            <Animated.View entering={FadeIn.delay(400).duration(300)} style={onboardingStyles.footer}>
              <Body size="small" style={{ color: colors.textSecondary }}>
                Don't have an account?{' '}
              </Body>
              <HapticPressable onPress={onSwitchToSignUp}>
                <Data size="small" style={{ color: colors.primary }}>Sign up</Data>
              </HapticPressable>
            </Animated.View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
