/**
 * Sign In Screen
 * Clean, minimal iOS-style sign in
 */

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ButtonLoader } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/context/theme-context';
import { Colors, Typography } from '@/constants/theme';

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
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const themeColors = Colors[colorScheme];
  const colors = {
    bg: themeColors.background,
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    textTertiary: themeColors.textTertiary,
    primary: themeColors.primary,
    primarySoft: isDark ? 'rgba(0,102,255,0.12)' : 'rgba(0,102,255,0.04)',
    inputBg: themeColors.surface,
    inputBorder: themeColors.border,
    inputFocusBorder: themeColors.primary,
    error: themeColors.error,
    divider: themeColors.border,
    border: themeColors.border,
    surfaceBg: themeColors.surface,
  };

  const handleSubmit = async () => {
    if (!email || !password || isLoading) return;
    await onSignIn(email, password);
  };

  const isValid = email.length > 0 && password.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <ChevronLeftIcon color={colors.text} />
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>Sign in<Text style={{ color: colors.primary, opacity: 0.8 }}>.</Text></Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: `${colors.error}08` }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, { color: colors.text, backgroundColor: colors.inputBg }]}
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
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, styles.passwordInputInner, { color: colors.text, backgroundColor: colors.inputBg }]}
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
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={[styles.showText, { color: colors.textSecondary }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <Pressable onPress={onForgotPassword} style={styles.forgotButton}>
              <Text style={[styles.forgotText, { color: colors.textSecondary }]}>Forgot password?</Text>
            </Pressable>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: (!isValid || isLoading) ? 0.4 : pressed ? 0.9 : 1 }
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <Text style={[styles.submitButtonText, { color: themeColors.primaryForeground }]}>Continue</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Divider */}
          {(onGoogleSignIn || onAppleSignIn || onPasskeySignIn) && (
            <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </Animated.View>
          )}

          {/* Quick Sign In Options */}
          {(onGoogleSignIn || onAppleSignIn || onPasskeySignIn) && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.socialSection}>
              {/* All buttons in a row */}
              <View style={styles.socialRow}>
                {/* Passkey */}
                {onPasskeySignIn && (
                  <Pressable
                    onPress={onPasskeySignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      { backgroundColor: colors.inputBg, borderColor: colors.border, opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 }
                    ]}
                  >
                    <PasskeyIcon color={colors.text} />
                  </Pressable>
                )}

                {/* Apple */}
                {onAppleSignIn && Platform.OS === 'ios' && (
                  <Pressable
                    onPress={onAppleSignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      { backgroundColor: isDark ? '#FFFFFF' : '#000000', opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 }
                    ]}
                  >
                    <AppleIcon color={isDark ? '#000000' : '#FFFFFF'} />
                  </Pressable>
                )}

                {/* Google */}
                {onGoogleSignIn && (
                  <Pressable
                    onPress={onGoogleSignIn}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      { backgroundColor: colors.inputBg, borderColor: colors.border, opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 }
                    ]}
                  >
                    <GoogleIcon />
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={onSwitchToSignUp}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign up</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ChevronLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeOffIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </Svg>
  );
}

function PasskeyIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 11a4 4 0 100-8 4 4 0 000 8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 21v-2a4 4 0 014-4h1.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 15a2 2 0 100 4 2 2 0 000-4zm0 0v-1m0 5v2m1.5-5.5l1 1m-5 0l1-1m0 4l-1 1m5 0l-1-1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    height: 52,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  title: {
    ...Typography.titleLarge,
  },
  errorBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    ...Typography.helper,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 4,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    ...Typography.bodySmall,
  },
  inputWrapper: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    ...Typography.bodySmall,
    backgroundColor: 'transparent',
  },
  passwordInputInner: {
    paddingRight: 52,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showText: {
    ...Typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: -4,
  },
  forgotText: {
    ...Typography.helper,
    fontFamily: 'Inter_600SemiBold',
  },
  submitButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    ...Typography.button,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.helper,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialSection: {
    gap: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconButton: {
    width: 60,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialButtonText: {
    fontSize: Typography.value.fontSize,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    ...Typography.helper,
  },
  footerLink: {
    ...Typography.helper,
    fontFamily: 'Inter_600SemiBold',
  },
});
