import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import * as AuthAPI from '@/lib/auth-api';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

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

  const navigation = useNavigation();

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
  const [pendingAction, setPendingAction] = useState<any>(null);
  const inputRef = useRef<TextInput>(null);

  usePreventRemove(pendingAction === null && !showSuccess, ({ data }) => {
    setPendingAction(data.action);
  });

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
        <View style={{ height: getSheetBottomPadding(insets.bottom) }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Verify your email" />

      <Text variant={SheetTypography.rowLabel} style={[styles.message, { color: colors.sheetLabelMuted }]}> 
        {notice}
      </Text>

      <View style={styles.form}>
        {/* OTP boxes */}
        <Pressable onPress={() => inputRef.current?.focus()} style={styles.otpRow}>
          {Array.from({ length: 6 }).map((_, i) => {
            const digit = code[i] ?? '';
            const isFocused = !isLoading && code.length === i;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: colors.fill2,
                    borderColor: isFocused ? colors.primary : digit ? colors.sheetBorder : colors.sheetBorder,
                    borderWidth: isFocused ? 1.5 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text
                  variant="title2"
                  style={{ color: colors.sheetLabel }}
                >
                  {digit}
                </Text>
                {isFocused && !digit ? (
                  <View style={[styles.cursor, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
            );
          })}
        </Pressable>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(value) => setCode(normalizeCode(value))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={handleVerify}
          autoFocus
          style={styles.hiddenInput}
        />

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

      {pendingAction ? (
        <View style={[styles.dismissBanner, { borderTopColor: colors.sheetBorder }]}>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Leave verification? Your code is still valid — you can sign in and verify later.
          </Text>
          <View style={styles.dismissActions}>
            <HapticPressable
              onPress={() => setPendingAction(null)}
              style={[styles.dismissBtn, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}
            >
              <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
                Stay
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

      <View style={{ height: getSheetBottomPadding(insets.bottom) }} />
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
    gap: Spacing.lg,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  otpBox: {
    flex: 1,
    height: Sizes.actionButtonLg * 1.4,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cursor: {
    position: 'absolute',
    bottom: 10,
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
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
    marginBottom: Spacing.sm,
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
