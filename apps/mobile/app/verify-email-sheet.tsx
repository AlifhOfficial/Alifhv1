import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import * as AuthAPI from '@/lib/auth-api';

const normalizeCode = (value: string): string => value.replace(/\D/g, '').slice(0, 6);
const RESEND_COOLDOWN_SECONDS = 45;
const VERIFY_MAX_ATTEMPTS = 5;

const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function VerifyEmailSheetScreen() {
  const params = useLocalSearchParams<{ email?: string; password?: string; mode?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const email = typeof params.email === 'string' ? params.email : '';
  const password = typeof params.password === 'string' ? params.password : '';
  const mode = params.mode === 'signin' ? 'signin' : 'signup';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState(
    email ? `We sent a 6-digit code to ${email}.` : 'Enter the 6-digit code from your email.'
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualSignInRequired, setManualSignInRequired] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [attemptsRemaining, setAttemptsRemaining] = useState(VERIFY_MAX_ATTEMPTS);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const canSubmit = email.length > 0 && code.length === 6 && !isLoading && attemptsRemaining > 0;

  async function handleVerify() {
    if (!canSubmit) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);
    setManualSignInRequired(false);

    try {
      const result = await AuthAPI.verifyEmailOTP(email, code);

      if (!result.success) {
        if (typeof result.attemptsRemaining === 'number') {
          setAttemptsRemaining(result.attemptsRemaining);
        }
        if (typeof result.retryAfterSeconds === 'number' && result.retryAfterSeconds > resendCountdown) {
          setResendCountdown(result.retryAfterSeconds);
        }

        if (result.code === 'TOO_MANY_ATTEMPTS') {
          setNotice(
            typeof result.retryAfterSeconds === 'number' && result.retryAfterSeconds > 0
              ? `Too many attempts. Try again in ${formatDuration(result.retryAfterSeconds)}.`
              : 'Too many attempts. Request a new code to continue.'
          );
          setCode('');
        } else if (typeof result.attemptsRemaining === 'number' && result.attemptsRemaining > 0) {
          setNotice(`${result.attemptsRemaining} attempts left before you need a new code.`);
        }

        setError(result.error || 'Invalid verification code.');
        return;
      }

      if (password.length > 0) {
        const signInResult = await AuthAPI.signInWithEmail(email, password);

        if (signInResult.success && signInResult.user) {
          signIn(signInResult.user);
          setShowSuccess(true);

          if (process.env.EXPO_OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          setTimeout(() => {
            router.back();
          }, 320);
          return;
        }
      }

      setManualSignInRequired(true);
      setNotice('Email verified. Sign in to continue.');
      setCode('');
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email || isResending || resendCountdown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const result = await AuthAPI.resendVerificationOTP(email, 'email-verification');

      if (!result.success) {
        if (typeof result.retryAfterSeconds === 'number') {
          setResendCountdown(result.retryAfterSeconds);
          setNotice(`You can request a new code in ${formatDuration(result.retryAfterSeconds)}.`);
        }
        setError(result.error || 'Failed to resend code.');
        return;
      }

      setAttemptsRemaining(VERIFY_MAX_ATTEMPTS);
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      setCode('');
      setNotice(`A fresh code was sent to ${email}.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  }

  function handleGoToSignIn() {
    router.replace({
      pathname: '/sign-in-sheet',
      params: email ? { email } : {},
    });
  }

  if (showSuccess) {
    return (
      <View style={[styles.container, styles.stateScreen, { backgroundColor: colors.sheet }]}> 
        <View style={styles.stateTopSpacer} />
        <View style={styles.stateContent}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.success }}>
            {mode === 'signup' ? 'Account Ready' : 'Email Verified'}
          </Text>
          <Text variant={SheetTypography.rowLabel} style={[styles.message, { color: colors.sheetLabelMuted }]}>
            Closing this sheet...
          </Text>
        </View>
        <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <View style={[styles.header, { borderBottomColor: colors.sheetBorder }]}>
        <Text variant={SheetTypography.headerTitle} style={{ color: colors.sheetLabel }}>
          Verify your email
        </Text>
        <Text variant={SheetTypography.rowLabel} style={[styles.message, { color: colors.sheetLabelMuted }]}>
          {notice}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.inputWrap, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}> 
          <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
            Verification code
          </Text>
          <TextInput
            value={code}
            onChangeText={(value) => setCode(normalizeCode(value))}
            placeholder="123456"
            placeholderTextColor={colors.sheetLabelMuted}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            editable={!isLoading}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            style={[styles.input, { color: colors.sheetLabel }]}
          />
        </View>

        {error ? (
          <Text variant="footnote" style={{ color: colors.error }} selectable>
            {error}
          </Text>
        ) : null}

        <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
          {attemptsRemaining > 0
            ? `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining`
            : 'Request a new code to continue'}
        </Text>

        <HapticPressable
          onPress={handleVerify}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.primaryAction,
            {
              backgroundColor: colors.primary,
              opacity: !canSubmit ? 0.45 : pressed ? 0.82 : 1,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
              Verify Email
            </Text>
          )}
        </HapticPressable>

        <View style={styles.linksRow}>
          <HapticPressable onPress={handleResend} disabled={isLoading || isResending || resendCountdown > 0}>
            <Text variant={SheetTypography.rowLabel} style={{ color: colors.primary }}>
              {isResending ? 'Sending...' : resendCountdown > 0 ? `Resend in ${formatDuration(resendCountdown)}` : 'Resend code'}
            </Text>
          </HapticPressable>

          {manualSignInRequired ? (
            <HapticPressable onPress={handleGoToSignIn}>
              <Text variant={SheetTypography.rowLabel} style={{ color: colors.primary }}>
                Go to sign in
              </Text>
            </HapticPressable>
          ) : null}
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
    gap: Spacing.xs,
  },
  form: {
    gap: Spacing.md,
  },
  inputWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  input: {
    fontSize: 22,
    minHeight: Sizes.actionButtonSm,
    letterSpacing: 6,
  },
  primaryAction: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Sizes.actionButtonMd,
  },
  message: {
    textAlign: 'center',
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
