import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, SheetHeader, Text } from '@/components/ui';
import { Colors, Radius, Sizes, Spacing, SheetChrome, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth, type AuthSheetContext } from '@/context/auth-context';
import { getSheetBottomPadding } from '@/lib/sheet-layout';

const CONTEXT_MESSAGES: Record<AuthSheetContext, { title: string; subtitle: string }> = {
  profile: {
    title: 'Your Profile Awaits',
    subtitle: 'Sign in to manage your profile, track listings, and connect with buyers',
  },
  saved: {
    title: 'Save Your Favorites',
    subtitle: 'Sign in to save listings and sync across all your devices',
  },
  messages: {
    title: 'Start Chatting',
    subtitle: 'Sign in to message sellers and negotiate deals',
  },
  listings: {
    title: 'List Your Vehicle',
    subtitle: 'Sign in to create listings and reach thousands of buyers',
  },
  bookings: {
    title: 'View Your Bookings',
    subtitle: 'Sign in to manage your test drive appointments on Revvup',
  },
  default: {
    title: 'Welcome to RevvUp',
    subtitle: 'Sign in to unlock all features and get the full experience',
  },
};

export default function AuthPromptScreen() {
  const params = useLocalSearchParams<{ context?: string; title?: string; subtitle?: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { hideAuthSheet, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const context: AuthSheetContext =
    params.context === 'profile' ||
    params.context === 'saved' ||
    params.context === 'messages' ||
    params.context === 'bookings' ||
    params.context === 'listings'
      ? params.context
      : 'default';

  const displayTitle =
    typeof params.title === 'string' && params.title.length > 0
      ? params.title
      : CONTEXT_MESSAGES[context].title;

  const displaySubtitle =
    typeof params.subtitle === 'string' && params.subtitle.length > 0
      ? params.subtitle
      : CONTEXT_MESSAGES[context].subtitle;

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    hideAuthSheet();
    router.back();
  }, [hideAuthSheet, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    return () => {
      hideAuthSheet();
    };
  }, [hideAuthSheet]);

  if (isAuthLoading || isAuthenticated) {
    return null;
  }

  const handleOpenSignUp = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    hideAuthSheet();
    router.replace('/sign-up-sheet');
  };

  const handleSignIn = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    hideAuthSheet();
    router.replace('/sign-in-sheet');
  };

  const handleSignUp = () => {
    handleOpenSignUp();
  };

  const handleDismiss = () => {
    hideAuthSheet();
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <Animated.View entering={FadeInUp.duration(220)} style={styles.content}>
        <SheetHeader title={displayTitle} />

        <Text
          variant={SheetTypography.rowLabel}
          style={[styles.subtitle, { color: colors.sheetLabelMuted }]}
        >
          {displaySubtitle}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(60).duration(220)}
        style={[
          styles.actions,
          {
            paddingBottom: getSheetBottomPadding(insets.bottom, Spacing.sm),
          },
        ]}
      >
        <View style={styles.actionRow}>
          <HapticPressable
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
              Sign In
            </Text>
          </HapticPressable>

          <HapticPressable
            onPress={handleSignUp}
            style={({ pressed }) => [
              styles.secondaryAction,
              {
                borderColor: colors.sheetBorder,
                backgroundColor: colors.fill2,
                opacity: pressed ? 0.74 : 1,
              },
            ]}
          >
            <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.sheetLabel }}>
              Sign Up
            </Text>
          </HapticPressable>
        </View>

        <HapticPressable onPress={handleDismiss} style={styles.dismissAction}>
          <Text variant={SheetTypography.rowLabel} style={{ color: colors.sheetLabelMuted }}>
            Maybe Later
          </Text>
        </HapticPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryAction: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissAction: {
    alignSelf: 'center',
    minHeight: Sizes.actionButtonMd,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
});
