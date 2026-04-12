import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { GoogleIcon, HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import * as AuthAPI from '@/lib/auth-api';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SignInSheetScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showSignInSuccess, setShowSignInSuccess] = useState(false);

  const canSubmit = isValidEmail(email) && password.length > 0 && !isLoading && !isAuthenticating;

  async function handleSubmit() {
    if (!canSubmit) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsAuthenticating(true);
    setIsLoading(true);
    setShowSignInSuccess(false);
    setError(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await AuthAPI.signInWithEmail(normalizedEmail, password);

      if (result.needsVerification) {
        await AuthAPI.resendVerificationOTP(normalizedEmail, 'email-verification').catch(() => null);
        setIsAuthenticating(false);
        router.replace({
          pathname: '/verify-email-sheet',
          params: {
            email: normalizedEmail,
            password,
            mode: 'signin',
          },
        });
        return;
      }

      if (!result.success || !result.user) {
        setError(result.error || 'Sign in failed. Please try again.');
        return;
      }

      signIn(result.user);
      setIsAuthenticating(false);
      setShowSignInSuccess(true);

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => {
        router.back();
      }, 320);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
      setIsAuthenticating(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (isLoading || isAuthenticating) return;

    router.push({
      pathname: '/forgot-password-sheet',
      params: email.trim().length > 0
        ? { email: email.toLowerCase().trim() }
        : {},
    });
  }

  async function handleGoogleAuth() {
    if (isLoading || isAuthenticating) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthAPI.signInWithGoogle();

      if (!result.success || !result.user) {
        setError(result.error || 'Google sign in failed. Please try again.');
        return;
      }

      signIn(result.user);

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => {
        router.back();
      }, 220);
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSignUp() {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.replace({
      pathname: '/sign-up-sheet',
      params: email.trim().length > 0 ? { email: email.toLowerCase().trim() } : {},
    });
  }

  if (isAuthenticating || showSignInSuccess) {
    return (
      <View style={[styles.container, styles.stateScreen, { backgroundColor: colors.sheet }]}> 
        <View style={styles.stateTopSpacer} />
        <View style={styles.stateContent}>
          {isAuthenticating ? (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted }}>
                Signing in...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.success }}>
                Signed In
              </Text>
            </>
          )}
        </View>
        <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Welcome to Revvup" />

      <View style={styles.form}>
        <View style={[styles.inputWrap, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}> 
          <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
            Email
          </Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.sheetLabelMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={[styles.input, { color: colors.sheetLabel }]}
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}> 
          <View style={styles.passwordRow}>
            <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
              Password
            </Text>
            <HapticPressable onPress={() => setShowPassword((value) => !value)} disabled={isLoading}>
              <Text variant="caption1" style={{ color: colors.primary }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </HapticPressable>
          </View>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.sheetLabelMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[styles.input, { color: colors.sheetLabel }]}
          />
        </View>

        {error ? (
          <Text variant="footnote" style={{ color: colors.error }} selectable>
            {error}
          </Text>
        ) : null}

        <HapticPressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: colors.primary,
              opacity: !canSubmit ? 0.45 : pressed ? 0.82 : 1,
            },
          ]}
        >
          <Text
            variant={SheetTypography.rowLabelSelected}
            style={{ color: colors.primaryForeground }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Text>
        </HapticPressable>

        <HapticPressable
          onPress={handleGoogleAuth}
          disabled={isLoading || isAuthenticating}
          style={({ pressed }) => [
            styles.secondaryAction,
            {
              borderColor: colors.sheetBorder,
              backgroundColor: colors.fill2,
              opacity: isLoading || isAuthenticating ? 0.55 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={styles.googleLabelRow}>
            <GoogleIcon size={18} />
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
              Continue with Google
            </Text>
          </View>
        </HapticPressable>

        <View style={styles.linksRow}>
          <HapticPressable onPress={handleForgotPassword} disabled={isLoading}>
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.primary }}>
              Forgot password?
            </Text>
          </HapticPressable>

          <HapticPressable onPress={handleSignUp} disabled={isLoading}>
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.primary }}>
              Create account
            </Text>
          </HapticPressable>
        </View>
      </View>

      <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: SheetChrome.headerPaddingBottom,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SheetChrome.headerMarginBottom,
    alignItems: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  inputWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    fontSize: 16,
    minHeight: Sizes.actionButtonSm,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryAction: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Sizes.actionButtonMd,
  },
  stateScreen: {
    justifyContent: 'flex-start',
  },
  stateTopSpacer: {
    height: Spacing.xl + SheetChrome.headerPaddingBottom,
  },
  stateContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    gap: Spacing.sm,
  },
});
