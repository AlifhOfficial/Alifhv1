import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, Text } from '@/components/ui';
import { BrandColors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import {
  AuthErrorBanner,
  AuthField,
  AuthPrimaryButton,
  AuthSection,
  AuthScreenShell,
} from './auth-theme';

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

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
  const { colors } = useTheme();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = isValidEmail(email) && password.length > 0;

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    await onSignIn(email.toLowerCase().trim(), password);
  };

  return (
    <AuthScreenShell
      title="Welcome back"
      subtitle="Sign in to manage listings, buyer messages, and test drive requests."
      eyebrow="Welcome back"
      onBack={onBack}
      footer={
        <View style={styles.centered}>
          <Text variant="subhead" tone="secondary">
            New to Revvup?{' '}
          </Text>
          <Text variant="subhead" style={{ color: colors.primary }} onPress={onSwitchToSignUp}>
            Create your account
          </Text>
        </View>
      }
    >
      <AuthErrorBanner error={error} />

      <AuthSection>
        <AuthField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!isLoading}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <View style={styles.passwordGroup}>
          <AuthField
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoComplete={Platform.OS === 'android' ? 'off' : 'password'}
            textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : undefined}
            returnKeyType="done"
            editable={!isLoading}
            onSubmitEditing={handleSubmit}
            right={
              <HapticPressable onPress={() => setShowPassword((value) => !value)}>
                <Text variant="subhead" tone="secondary">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </HapticPressable>
            }
          />
          <View style={styles.forgotRow}>
            <HapticPressable onPress={onForgotPassword} disabled={isLoading}>
              <Text variant="subhead" style={{ color: colors.primary }}>
                Forgot password?
              </Text>
            </HapticPressable>
          </View>
        </View>

        <AuthPrimaryButton onPress={handleSubmit} loading={isLoading} disabled={!isValid}>
          Sign in
        </AuthPrimaryButton>
      </AuthSection>

      {(onGoogleSignIn || onAppleSignIn) ? (
        <>
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
            <Text variant="footnote" tone="muted">or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.separator }]} />
          </View>
          <View style={styles.socialStack}>
            {onAppleSignIn && Platform.OS === 'ios' ? (
              <HapticPressable
                onPress={onAppleSignIn}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.socialButton,
                  {
                    backgroundColor: colors.label,
                    borderColor: colors.label,
                    opacity: pressed || isLoading ? 0.88 : 1,
                  },
                ]}
              >
                <Ionicons name="logo-apple" size={Sizes.iconSm} color={colors.background} />
                <Text variant="headline" style={{ color: colors.background }}>
                  Continue with Apple
                </Text>
              </HapticPressable>
            ) : null}
            {onGoogleSignIn ? (
              <HapticPressable
                onPress={onGoogleSignIn}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.socialButton,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    opacity: pressed || isLoading ? 0.92 : 1,
                  },
                ]}
              >
                <GoogleIcon size={Sizes.iconSm} />
                <Text variant="headline" style={{ color: colors.black }}>
                  Continue with Google
                </Text>
              </HapticPressable>
            ) : null}
          </View>
        </>
      ) : null}
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordGroup: {
    gap: Spacing.sm,
  },
  forgotRow: {
    alignItems: 'flex-end',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  socialStack: {
    gap: Spacing.md,
  },
  socialButton: {
    minHeight: Sizes.actionButtonLg,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
