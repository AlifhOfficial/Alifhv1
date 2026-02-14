/**
 * Sign In Screen
 * Clean, minimal iOS-style sign in using design system tokens
 */

import React, { useState } from 'react';
import { 
  View, 
  Text as RNText,
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { HapticPressable, ButtonLoader } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { Colors, Spacing } from '@/constants/theme';
import { Display, Body, Data, Supporting, ButtonText } from '@/components/ui';
import { authStyles } from './auth-styles';
import { ChevronLeftIcon, GoogleIcon, AppleIcon, PasskeyIcon } from './icons';

interface SignInScreenProps {
  onBack: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onAppleSignIn?: () => Promise<void>;
  onPasskeySignIn?: () => Promise<void>;
  onSwitchToSignUp: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignInScreen({
  onBack,
  onSignIn,
  onForgotPassword,
  onGoogleSignIn,
  onAppleSignIn,
  onPasskeySignIn,
  onSwitchToSignUp,
  isLoading = false,
  error,
}: SignInScreenProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || isLoading) return;
    await onSignIn(email, password);
  };

  const isValid = email.length > 0 && password.length > 0;

  return (
    <View style={[authStyles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[
            authStyles.scrollContent, 
            { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={authStyles.header}>
            <HapticPressable
              onPress={onBack}
              style={({ pressed }) => [authStyles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </HapticPressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={authStyles.titleSection}>
            <Display size="large">
              Sign in<RNText style={{ color: colors.primary }}>.</RNText>
            </Display>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[authStyles.errorBox, { backgroundColor: colors.errorMuted }]}
            >
              <Body size="small" tone="error" style={authStyles.errorText}>{error}</Body>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={authStyles.form}>
            {/* Email */}
            <View style={authStyles.inputGroup}>
              <Data size="mini" tone="secondary" style={authStyles.inputLabel}>Email</Data>
              <View style={[
                authStyles.inputWrapper, 
                { backgroundColor: colors.input, borderColor: colors.border }
              ]}>
                <TextInput
                  style={[authStyles.inputInner, { color: colors.text }]}
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
                />
              </View>
            </View>

            {/* Password */}
            <View style={authStyles.inputGroup}>
              <Data size="mini" tone="secondary" style={authStyles.inputLabel}>Password</Data>
              <View style={[
                authStyles.inputWrapper, 
                { backgroundColor: colors.input, borderColor: colors.border }
              ]}>
                <TextInput
                  style={[
                    authStyles.inputInner, 
                    authStyles.passwordInputInner, 
                    { color: colors.text }
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete={Platform.OS === 'android' ? 'off' : 'password'}
                  textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                  selectionColor={colors.primary}
                  underlineColorAndroid="transparent"
                  editable={!isLoading}
                />
                <HapticPressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={authStyles.showPasswordButton}
                >
                  <Data size="mini" tone="secondary">
                    {showPassword ? 'Hide' : 'Show'}
                  </Data>
                </HapticPressable>
              </View>
            </View>

            {/* Forgot Password */}
            <HapticPressable onPress={onForgotPassword} style={authStyles.forgotButton}>
              <Data size="mini" tone="secondary">Forgot password?</Data>
            </HapticPressable>

            {/* Sign In Button */}
            <HapticPressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                authStyles.submitButton,
                { 
                  backgroundColor: (!isValid || isLoading) ? colors.surface : colors.primary,
                  opacity: pressed ? 0.9 : 1 
                }
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <ButtonText 
                  style={{ color: (!isValid || isLoading) ? colors.textTertiary : colors.primaryForeground }}
                >
                  Continue
                </ButtonText>
              )}
            </HapticPressable>
          </Animated.View>

          {/* Divider */}
          {(onGoogleSignIn || onAppleSignIn || onPasskeySignIn) && (
            <Animated.View entering={FadeIn.delay(250).duration(300)} style={authStyles.dividerContainer}>
              <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
              <Supporting size="small" style={authStyles.dividerText}>or continue with</Supporting>
              <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
            </Animated.View>
          )}

          {/* Quick Sign In Options */}
          {(onGoogleSignIn || onAppleSignIn || onPasskeySignIn) && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={authStyles.socialSection}>
              <View style={authStyles.socialRow}>
                {/* Passkey */}
                {onPasskeySignIn && (
                  <HapticPressable
                    onPress={onPasskeySignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      authStyles.socialIconButton,
                      { 
                        backgroundColor: colors.input, 
                        borderColor: colors.border, 
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 
                      }
                    ]}
                  >
                    <PasskeyIcon color={colors.text} />
                  </HapticPressable>
                )}

                {/* Apple */}
                {onAppleSignIn && Platform.OS === 'ios' && (
                  <HapticPressable
                    onPress={onAppleSignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      authStyles.socialIconButton,
                      authStyles.socialButtonNoBorder,
                      { 
                        backgroundColor: isDark ? Colors.light.background : Colors.dark.background, 
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 
                      }
                    ]}
                  >
                    <AppleIcon color={isDark ? Colors.dark.background : Colors.light.background} />
                  </HapticPressable>
                )}

                {/* Google */}
                {onGoogleSignIn && (
                  <HapticPressable
                    onPress={onGoogleSignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      authStyles.socialIconButton,
                      { 
                        backgroundColor: colors.input, 
                        borderColor: colors.border, 
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 
                      }
                    ]}
                  >
                    <GoogleIcon />
                  </HapticPressable>
                )}
              </View>
            </Animated.View>
          )}

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={authStyles.footer}>
            <Body size="small" tone="secondary">
              Don't have an account?{' '}
            </Body>
            <HapticPressable onPress={onSwitchToSignUp}>
              <Data tone="primary">Sign up</Data>
            </HapticPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
