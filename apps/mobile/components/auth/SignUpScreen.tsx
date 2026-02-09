/**
 * Sign Up Screen
 * Clean, minimal iOS-style sign up
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
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing['2xl'] }]}
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
            <Text style={[styles.title, { color: colors.text }]}>
              Create account<Text style={{ color: colors.primary }}>.</Text>
            </Text>
          </Animated.View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.errorBox, { backgroundColor: colors.errorMuted }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Animated.View>
          )}

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, { color: colors.text, backgroundColor: colors.input }]}
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
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, { color: colors.text, backgroundColor: colors.input }]}
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
              <View style={[styles.inputWrapper, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.inputInner, styles.passwordInputInner, { color: colors.text, backgroundColor: colors.input }]}
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
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showButton}
                >
                  <Text style={[styles.showText, { color: colors.textSecondary }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>

              {/* Password Requirements */}
              {password.length > 0 && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.requirements}>
                  <PasswordRequirement met={hasMinLength} text="8+ characters" colors={colors} />
                  <PasswordRequirement met={hasLetter} text="Letter" colors={colors} />
                  <PasswordRequirement met={hasNumber} text="Number" colors={colors} />
                </Animated.View>
              )}
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={({ pressed }) => [
                styles.submitButton,
                { 
                  backgroundColor: (!isValid || isLoading) ? colors.surface : colors.primary,
                  opacity: pressed ? 0.9 : 1 
                }
              ]}
            >
              {isLoading ? (
                <ButtonLoader size="sm" variant="white" />
              ) : (
                <Text style={[
                  styles.submitButtonText, 
                  { color: (!isValid || isLoading) ? colors.textTertiary : colors.primaryForeground }
                ]}>
                  Continue
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Divider */}
          {(onGoogleSignUp || onAppleSignUp || onPasskeySignUp) && (
            <Animated.View entering={FadeIn.delay(250).duration(300)} style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </Animated.View>
          )}

          {/* Quick Sign Up Options */}
          {(onGoogleSignUp || onAppleSignUp || onPasskeySignUp) && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.socialSection}>
              <View style={styles.socialRow}>
                {/* Passkey */}
                {onPasskeySignUp && (
                  <Pressable
                    onPress={onPasskeySignUp}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      { backgroundColor: colors.input, borderColor: colors.border, opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 }
                    ]}
                  >
                    <PasskeyIcon color={colors.text} />
                  </Pressable>
                )}

                {/* Apple */}
                {onAppleSignUp && Platform.OS === 'ios' && (
                  <Pressable
                    onPress={onAppleSignUp}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      styles.appleButton,
                      { 
                        backgroundColor: isDark ? Colors.light.background : Colors.dark.background, 
                        opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 
                      }
                    ]}
                  >
                    <AppleIcon color={isDark ? Colors.dark.background : Colors.light.background} />
                  </Pressable>
                )}

                {/* Google */}
                {onGoogleSignUp && (
                  <Pressable
                    onPress={onGoogleSignUp}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.socialIconButton,
                      { backgroundColor: colors.input, borderColor: colors.border, opacity: isLoading ? 0.5 : pressed ? 0.7 : 1 }
                    ]}
                  >
                    <GoogleIcon />
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          {/* Terms */}
          <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.terms}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.textSecondary }}>Terms</Text>
              {' & '}
              <Text style={{ color: colors.textSecondary }}>Privacy Policy</Text>
            </Text>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(450).duration(300)} style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={onSwitchToSignIn}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
  colors: {
    success: string;
    textTertiary: string;
  };
}

function PasswordRequirement({ met, text, colors }: PasswordRequirementProps) {
  return (
    <View style={styles.requirementRow}>
      <View style={[styles.requirementDot, { backgroundColor: met ? colors.success : colors.textTertiary }]} />
      <Text style={[styles.requirementText, { color: met ? colors.success : colors.textTertiary }]}>
        {text}
      </Text>
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

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
      <Path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 21v-2a4 4 0 014-4h1.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 15a2 2 0 100 4 2 2 0 000-4zm0 0v-1m0 5v2m1.5-5.5l1 1m-5 0l1-1m0 4l-1 1m5 0l-1-1" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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
    paddingHorizontal: Spacing['2xl'],
  },
  header: {
    height: 52,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.titleLarge,
  },
  errorBox: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.bodyMini,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.valueSmall,
    marginLeft: Spacing.xs,
  },
  input: {
    height: 54,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    ...Typography.bodySmall,
  },
  inputWrapper: {
    height: 54,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Spacing.lg,
    ...Typography.bodySmall,
    backgroundColor: 'transparent',
  },
  passwordInputInner: {
    paddingRight: 60,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  showButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showText: {
    ...Typography.valueSmall,
  },
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  requirementText: {
    ...Typography.helper,
  },
  submitButton: {
    height: 54,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    ...Typography.button,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing['3xl'],
    gap: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.helper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialSection: {
    gap: Spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialIconButton: {
    width: 60,
    height: 54,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButton: {
    borderWidth: 0,
  },
  terms: {
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.sm,
  },
  termsText: {
    ...Typography.bodyMini,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing['2xl'],
  },
  footerText: {
    ...Typography.bodyMini,
  },
  footerLink: {
    ...Typography.value,
  },
});
