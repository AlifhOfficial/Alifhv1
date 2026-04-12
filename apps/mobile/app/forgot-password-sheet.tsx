import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import * as AuthAPI from '@/lib/auth-api';

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function ForgotPasswordSheetScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const hasProgress = !resetSent && !isLoading && email.trim().length > 0;

  usePreventRemove(pendingAction === null && hasProgress, ({ data }) => {
    setPendingAction(data.action);
  });

  useEffect(() => {
    if (retryCountdown <= 0) return;

    const timer = setTimeout(() => {
      setRetryCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [retryCountdown]);

  const canSubmit = isValidEmail(email) && !isLoading && retryCountdown === 0;

  async function handleSubmit() {
    if (!canSubmit) return;

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthAPI.requestPasswordReset(email.toLowerCase().trim());

      if (!result.success) {
        if (typeof result.retryAfterSeconds === 'number') {
          setRetryCountdown(result.retryAfterSeconds);
          setError(`${result.error || 'Please wait before retrying.'} (${formatDuration(result.retryAfterSeconds)})`);
        } else {
          setError(result.error || 'Failed to send reset link.');
        }
        return;
      }

      setResetSent(true);

      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToSignIn() {
    router.back();
  }

  if (resetSent) {
    return (
      <View style={[styles.container, styles.stateScreen, { backgroundColor: colors.sheet }]}> 
        <View style={styles.stateTopSpacer} />
        <View style={styles.stateContent}>
          <Ionicons name="mail-open-outline" size={44} color={colors.success} />
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.success }}>
            Reset Link Sent
          </Text>
          <Text variant={SheetTypography.rowLabel} style={[styles.message, { color: colors.sheetLabelMuted }]}>
            Check your inbox, then come back and sign in with your new password.
          </Text>
          <HapticPressable
            onPress={handleBackToSignIn}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.82 : 1,
                alignSelf: 'stretch',
                marginTop: Spacing.lg,
              },
            ]}
          >
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
              Back to sign in
            </Text>
          </HapticPressable>
        </View>
        <View style={{ height: insets.bottom + SheetChrome.bottomSafeAreaSpacing }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <SheetHeader title="Reset your password" />

      <Text variant={SheetTypography.rowLabel} style={[styles.message, { color: colors.sheetLabelMuted }]}> 
        We&apos;ll email you a reset link.
      </Text>

      <View style={styles.form}>
        <View style={[styles.inputWrap, { backgroundColor: colors.fill2, borderColor: colors.sheetBorder }]}> 
          <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
            Email
          </Text>
          <TextInput
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

        {retryCountdown > 0 ? (
          <Text variant="caption1" style={{ color: colors.sheetLabelMuted }}>
            Try again in {formatDuration(retryCountdown)}
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
          {isLoading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
              {retryCountdown > 0 ? `Retry in ${formatDuration(retryCountdown)}` : 'Send Reset Link'}
            </Text>
          )}
        </HapticPressable>
      </View>

      {pendingAction ? (
        <View style={[styles.dismissBanner, { borderTopColor: colors.sheetBorder }]}>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabel }}>
            Leave password reset? Come back any time — your email stays saved.
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
  primaryAction: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: Spacing.md,
  },  dismissBanner: {
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
  },});