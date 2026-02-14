/**
 * Sign Up Screen
 * Clean, minimal iOS-style sign up using design system tokens
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
import { Colors, Spacing, type ThemeColors } from '@/constants/theme';
import { Display, Body, Data, Supporting, ButtonText } from '@/components/ui';
import { authStyles } from './auth-styles';
import { ChevronLeftIcon, GoogleIcon, AppleIcon, PasskeyIcon } from './icons';

interface SignUpScreenProps {
  onBack: () => void;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onGoogleSignUp?: () => Promise<void>;
  onAppleSignUp?: () => Promise<void>;
  onPasskeySignUp?: () => Promise<void>;
  onSwitchToSignIn: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignUpScreen({
  onBack,
  onSignUp,
  onGoogleSignUp,
  onAppleSignUp,
  onPasskeySignUp,
  onSwitchToSignIn,
  isLoading = false,
  error,
}: SignUpScreenProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || isLoading) return;
    await onSignUp(name, email, password);
  };

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;
  const isValid = name.length > 0 && email.length > 0 && isPasswordValid;

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
              Create account<RNText style={{ color: colors.primary }}>.</RNText>
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
            {/* Name */}
            <View style={authStyles.inputGroup}>
              <Data size="mini" tone="secondary" style={authStyles.inputLabel}>Name</Data>
              <View style={[
                authStyles.inputWrapper, 
                { backgroundColor: colors.input, borderColor: colors.border }
              ]}>
                <TextInput
                  style={[authStyles.inputInner, { color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  textContentType="name"
                  selectionColor={colors.primary}
                  underlineColorAndroid="transparent"
                  editable={!isLoading}
                />
              </View>
            </View>

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
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  autoComplete={Platform.OS === 'android' ? 'off' : 'new-password'}
                  textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
                  passwordRules="minlength: 8; required: lower; required: digit;"
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

              {/* Password Requirements */}
              {password.length > 0 && (
                <Animated.View entering={FadeIn.duration(200)} style={authStyles.requirements}>
                  <PasswordRequirement met={hasMinLength} text="8+ characters" colors={colors} />
                  <PasswordRequirement met={hasLetter} text="Letter" colors={colors} />
                  <PasswordRequirement met={hasNumber} text="Number" colors={colors} />
                </Animated.View>
              )}
            </View>

            {/* Sign Up Button */}
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
          {(onGoogleSignUp || onAppleSignUp || onPasskeySignUp) && (
            <Animated.View entering={FadeIn.delay(250).duration(300)} style={authStyles.dividerContainer}>
              <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
              <Supporting size="small" style={authStyles.dividerText}>or continue with</Supporting>
              <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
            </Animated.View>
          )}

          {/* Quick Sign Up Options */}
          {(onGoogleSignUp || onAppleSignUp || onPasskeySignUp) && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={authStyles.socialSection}>
              <View style={authStyles.socialRow}>
                {/* Passkey */}
                {onPasskeySignUp && (
                  <HapticPressable
                    onPress={onPasskeySignUp}
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
                {onAppleSignUp && Platform.OS === 'ios' && (
                  <HapticPressable
                    onPress={onAppleSignUp}
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
                {onGoogleSignUp && (
                  <HapticPressable
                    onPress={onGoogleSignUp}
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

          {/* Terms */}
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={authStyles.terms}>
            <Body size="small" tone="muted" style={authStyles.termsText}>
              By continuing, you agree to our{' '}
              <RNText style={{ color: colors.textSecondary }}>Terms</RNText>
              {' & '}
              <RNText style={{ color: colors.textSecondary }}>Privacy Policy</RNText>
            </Body>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(450).duration(300)} style={authStyles.footer}>
            <Body size="small" tone="secondary">
              Already have an account?{' '}
            </Body>
            <HapticPressable onPress={onSwitchToSignIn}>
              <Data tone="primary">Sign in</Data>
            </HapticPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
  colors: ThemeColors;
}

function PasswordRequirement({ met, text, colors }: PasswordRequirementProps) {
  return (
    <View style={authStyles.requirementRow}>
      <View style={[
        authStyles.requirementDot, 
        { backgroundColor: met ? colors.success : colors.textTertiary }
      ]} />
      <Supporting size="small" style={{ color: met ? colors.success : colors.textTertiary }}>
        {text}
      </Supporting>
    </View>
  );
}
