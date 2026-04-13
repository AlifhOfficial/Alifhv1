import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { GoogleIcon, HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import * as AuthAPI from '@/lib/auth-api';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function SignUpSheetScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signIn, isAuthenticated } = useAuth();

  const navigation = useNavigation();

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showSignInSuccess, setShowSignInSuccess] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const hasProgress =
    !showSuccess &&
    !showSignInSuccess &&
    !isLoading &&
    !isAuthenticating &&
    (name.trim().length > 0 || email.trim().length > 0 || password.length > 0);

  // usePreventRemove fires when user swipes/taps to dismiss the sheet.
  // Setting pendingAction shows the in-sheet confirmation banner.
  // When pendingAction !== null the hook is disabled, so navigation.dispatch goes through.
  usePreventRemove(pendingAction === null && hasProgress, ({ data }) => {
    setPendingAction(data.action);
  });

  const canSubmit =
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    !isLoading &&
    !isAuthenticating;

  useEffect(() => {
    if (!isAuthenticated || (!isAuthenticating && !showSignInSuccess)) return;

    setIsAuthenticating(false);
    setShowSignInSuccess(true);

    const timeout = setTimeout(() => {
      router.back();
    }, 320);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isAuthenticating, showSignInSuccess]);

  async function handleSubmit() {
    if (!canSubmit) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const result = await AuthAPI.signUpWithEmail(name.trim(), normalizedEmail, password);

      if (!result.success) {
        setError(result.error || 'Failed to create account. Please try again.');
        return;
      }

      setShowSuccess(true);

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => {
        router.replace({
          pathname: '/verify-email-sheet',
          params: {
            email: normalizedEmail,
            password,
            mode: 'signup',
          },
        });
      }, 220);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSignIn() {
    if (isLoading || isAuthenticating) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.replace({
      pathname: '/sign-in-sheet',
      params: email.trim().length > 0 ? { email: email.toLowerCase().trim() } : {},
    });
  }

  async function handleGoogleAuth() {
    if (isLoading || isAuthenticating) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsAuthenticating(true);
    setIsLoading(true);
    setShowSignInSuccess(false);
    setError(null);

    try {
      const result = await AuthAPI.signUpWithGoogle();

      if (!result.success || !result.user) {
        setError(result.error || 'Google sign up failed. Please try again.');
        setIsAuthenticating(false);
        return;
      }

      signIn(result.user);

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign up failed. Please try again.');
      setIsAuthenticating(false);
    } finally {
      setIsLoading(false);
    }
  }

  if (showSuccess || isAuthenticating || showSignInSuccess) {
    return (
      <View style={[styles.container, styles.stateScreen, { backgroundColor: colors.sheet }]}> 
        <View style={styles.stateTopSpacer} />
        <View style={styles.stateContent}>
          {isAuthenticating ? (
            <>
              <Ionicons name="logo-google" size={42} color={colors.primary} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
                Signing In
              </Text>
              <Text
                variant={SheetTypography.rowLabel}
                style={[styles.stateMessage, { color: colors.sheetLabelMuted }]}
              >
                Finishing Google sign in...
              </Text>
            </>
          ) : showSignInSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.success }}>
                Signed In
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="mail-open-outline" size={42} color={colors.primary} />
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
                Account Created
              </Text>
              <Text
                variant={SheetTypography.rowLabel}
                style={[styles.stateMessage, { color: colors.sheetLabelMuted }]}
              >
                Finishing setup...
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
      <SheetHeader title="Join Revvup" />

      <Text variant={SheetTypography.rowLabel} style={[styles.subtitle, { color: colors.sheetLabelMuted }]}> 
        Create your account to get started on Revvup.
      </Text>

      <View style={styles.form}>
        <View style={[styles.inputWrap, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}> 
          <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
            Full name
          </Text>
          <TextInput
            ref={nameRef}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.sheetLabelMuted}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            style={[styles.input, { color: colors.sheetLabel }]}
          />
        </View>

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
            placeholder="At least 8 characters"
            placeholderTextColor={colors.sheetLabelMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
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
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
            {isLoading ? 'Creating account...' : 'Create Account'}
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

        <HapticPressable onPress={handleSignIn} disabled={isLoading} style={styles.secondaryLink}>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.primary }}>
            Already have an account? Sign in
          </Text>
        </HapticPressable>
      </View>

      {pendingAction ? (
        <View style={[styles.dismissBanner, { borderTopColor: colors.sheetBorder }]}>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Leave sign up? Your progress will be cleared.
          </Text>
          <View style={styles.dismissActions}>
            <HapticPressable
              onPress={() => setPendingAction(null)}
              style={[styles.dismissBtn, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}
            >
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
                Keep going
              </Text>
            </HapticPressable>
            <HapticPressable
              onPress={() => navigation.dispatch(pendingAction)}
              style={[styles.dismissBtn, { backgroundColor: colors.errorMuted, borderColor: colors.error }]}
            >
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.error }}>
                Leave
              </Text>
            </HapticPressable>
          </View>
        </View>
      ) : null}

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
    gap: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
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
  secondaryLink: {
    alignItems: 'center',
    justifyContent: 'center',
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
  stateMessage: {
    textAlign: 'center',
  },
  dismissBanner: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  dismissActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dismissBtn: {
    flex: 1,
    height: Sizes.actionButtonMd,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
