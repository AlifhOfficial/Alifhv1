/**
 * Sign In Screen - Simple OLED black themed sign in
 * Matches the onboarding aesthetic
 */

import { Text, HapticPressable, ButtonLoader } from '@/components/ui';
import React, { useState, useRef } from 'react';
import { View, TextInput, Platform, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, G, Rect, ClipPath, Defs } from 'react-native-svg';

import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { onboardingStyles, ONBOARDING_LAYOUT } from './onboarding-styles';

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

// Google logo with brand colors
function GoogleIcon({ size = Sizes.iconMd }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill={BrandColors.googleBlue}
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill={BrandColors.googleGreen}
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill={BrandColors.googleYellow}
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill={BrandColors.googleRed}
      />
    </Svg>
  );
}

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

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await onSignIn(email.toLowerCase().trim(), password);
  };

  return (
    <ScrollView
      style={[onboardingStyles.container, { backgroundColor: colors.black }]}
      contentContainerStyle={[
        onboardingStyles.content,
        { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing['2xl'] },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={onboardingStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={[onboardingStyles.backButton]}
            >
              <Ionicons name="chevron-back" size={Sizes.iconLg} color={colors.white} />
            </HapticPressable>
            <View style={{ flex: 1 }} />
            <View style={onboardingStyles.skipButton} />
          </Animated.View>

          {/* Hero Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={onboardingStyles.heroSection}>
            <Text variant="subhead" style={[onboardingStyles.greeting, { color: colors.primary }]} tone="secondary">
              Welcome back
            </Text>
            <Text variant="title2Emphasized" style={[onboardingStyles.title, { color: colors.white }]}>
              Sign in to continue
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[onboardingStyles.errorContainer, { backgroundColor: colors.errorMuted }]}
            >
              <Text variant="subhead" tone="error" style={onboardingStyles.errorText}>
                {error}
              </Text>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={onboardingStyles.inputSection}>
            {/* Email */}
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.white}08`,
                  borderColor: email.length > 0
                    ? isValidEmail(email) ? colors.primary : colors.error
                    : `${colors.white}15`,
                },
              ]}
            >
              <TextInput
                ref={emailRef}
                style={[onboardingStyles.inputInner, { color: colors.white }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
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
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Password */}
            <View
              style={[
                onboardingStyles.inputWrapper,
                {
                  backgroundColor: `${colors.white}08`,
                  borderColor: password.length > 0 ? colors.primary : `${colors.white}15`,
                },
              ]}
            >
              <TextInput
                ref={passwordRef}
                style={[
                  onboardingStyles.inputInner,
                  onboardingStyles.passwordInputInner,
                  { color: colors.white },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.labelTertiary}
                keyboardAppearance="dark"
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
                <Text variant="subhead" style={{ color: colors.labelTertiary }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </HapticPressable>
            </View>

            {/* Forgot Password */}
            <HapticPressable
              onPress={onForgotPassword}
              style={{ alignSelf: 'flex-end', paddingVertical: Spacing.xs }}
            >
              <Text variant="subhead" style={{ color: colors.labelSecondary }}>
                Forgot password?
              </Text>
            </HapticPressable>
          </Animated.View>

          {/* Sign In Action */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ gap: Spacing.lg }}>
            <HapticPressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm }}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="primary" />
              ) : (
                <Text variant="title3Emphasized" style={{ color: isValid ? colors.white : colors.labelTertiary }}>
                  Sign In
                </Text>
              )}
            </HapticPressable>

            {/* Social Auth */}
            {(onGoogleSignIn || onAppleSignIn) && (
              <View style={styles.socialSection}>
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Text variant="subhead" style={{ color: colors.labelTertiary }} tone="secondary">or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.socialButtonsRow}>
                  {/* Apple */}
                  {onAppleSignIn && Platform.OS === 'ios' && (
                    <HapticPressable
                      onPress={onAppleSignIn}
                      disabled={isLoading}
                      style={[
                        styles.socialButton,
                        { backgroundColor: colors.white, opacity: isLoading ? 0.5 : 1 },
                      ]}
                    >
                      <Ionicons name="logo-apple" size={Sizes.iconSm} color={colors.black} />
                    </HapticPressable>
                  )}

                  {/* Google */}
                  {onGoogleSignIn && (
                    <HapticPressable
                      onPress={onGoogleSignIn}
                      disabled={isLoading}
                      style={[
                        styles.socialButton,
                        { 
                          backgroundColor: colors.white, 
                          opacity: isLoading ? 0.5 : 1,
                        },
                      ]}
                    >
                      <GoogleIcon size={Sizes.iconMd} />
                    </HapticPressable>
                  )}
                </View>
              </View>
            )}

            {/* Switch to Sign Up */}
            <Animated.View entering={FadeIn.delay(400).duration(300)} style={onboardingStyles.footer}>
              <Text variant="subhead" style={{ color: colors.labelSecondary }}>
                Don't have an account?{' '}
              </Text>
              <HapticPressable onPress={onSwitchToSignUp}>
                <Text variant="subhead" style={{ color: colors.primary }}>Sign up</Text>
              </HapticPressable>
            </Animated.View>
          </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Social auth styles
  socialSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialButton: {
    width: ONBOARDING_LAYOUT.buttonHeight,
    height: ONBOARDING_LAYOUT.buttonHeight,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
