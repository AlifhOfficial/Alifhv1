import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { HapticPressable, Pill, Text } from '@/components/ui';
import { Colors, Radius, SheetChrome, SheetTypography, Sizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth, type AuthSheetContext } from '@/context/auth-context';

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
  const { hideAuthSheet, openAuthFlow } = useAuth();

  const context: AuthSheetContext =
    params.context === 'profile' ||
    params.context === 'saved' ||
    params.context === 'messages' ||
    params.context === 'bookings' ||
    params.context === 'listings'
      ? params.context
      : 'default';

  const displayTitle = useMemo(() => {
    if (typeof params.title === 'string' && params.title.length > 0) {
      return params.title;
    }
    return CONTEXT_MESSAGES[context].title;
  }, [context, params.title]);

  const displaySubtitle = useMemo(() => {
    if (typeof params.subtitle === 'string' && params.subtitle.length > 0) {
      return params.subtitle;
    }
    return CONTEXT_MESSAGES[context].subtitle;
  }, [context, params.subtitle]);

  useEffect(() => {
    return () => {
      hideAuthSheet();
    };
  }, [hideAuthSheet]);

  const handleSignIn = () => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    hideAuthSheet();
    router.back();
    setTimeout(() => {
      openAuthFlow();
    }, 150);
  };

  const handleDismiss = () => {
    hideAuthSheet();
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.sheet }]}> 
      <Animated.View entering={FadeInUp.delay(80).duration(360)} style={styles.textContent}>
        <Pill style={{ backgroundColor: colors.sheetSurface, borderColor: colors.sheetBorder }}>
          <Text
            variant={SheetTypography.supportingEmphasized}
            style={{ color: colors.sheetLabelMuted }}
            uppercase
          >
            Authentication Required
          </Text>
        </Pill>

        <Text variant="title3" style={[styles.title, { color: colors.sheetLabel }]}> 
          {displayTitle}
        </Text>
        <Text
          variant={SheetTypography.rowLabel}
          style={[styles.subtitle, { color: colors.sheetLabelMuted }]}
          tone="secondary"
        >
          {displaySubtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(360)} style={styles.actions}>
        <HapticPressable
          onPress={handleSignIn}
          style={({ pressed }) => [{
            height: Sizes.actionButtonLg,
            borderRadius: Radius.full,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.8 : 1,
          }]}
        >
          <Text variant={SheetTypography.rowLabelSelected} style={{ color: colors.primaryForeground }}>
            Sign In
          </Text>
        </HapticPressable>

        <HapticPressable
          onPress={handleDismiss}
          style={({ pressed }) => [{
            height: Sizes.actionButtonLg,
            borderRadius: Radius.full,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            borderWidth: 1,
            borderColor: colors.sheetBorder,
            backgroundColor: colors.sheetSurface,
            opacity: pressed ? 0.7 : 1,
          }]}
        >
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
    paddingHorizontal: SheetChrome.contentPaddingHorizontal,
    paddingTop: SheetChrome.contentPaddingTop,
    paddingBottom: SheetChrome.bottomSafeAreaSpacing,
    overflow: 'hidden',
    gap: Spacing['2xl'],
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
});