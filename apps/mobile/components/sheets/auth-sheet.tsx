/**
 * AuthSheet - Premium auth sheet for unauthenticated users
 * Uses @gorhom/bottom-sheet modal with the RevvupLogo
 * Shown when user tries to access features requiring authentication
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { HapticPressable, Data, Heading, Supporting } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { RevvupLogo } from '@/components/ui/loaders/revvup-logo';
import { AuthDoodle } from './auth-doodle';

interface AuthSheetProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
  /** Optional context for why auth is needed */
  context?: 'profile' | 'saved' | 'messages' | 'listings' | 'default';
}

// Contextual messages based on what the user is trying to do
const CONTEXT_MESSAGES: Record<string, { title: string; subtitle: string }> = {
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
  default: {
    title: 'Welcome to RevvUp',
    subtitle: 'Sign in to unlock all features and get the full experience',
  },
};

export function AuthSheet({ 
  visible, 
  onClose, 
  onSignIn,
  title,
  subtitle,
  context = 'default',
}: AuthSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Get contextual messages
  const messages = CONTEXT_MESSAGES[context] || CONTEXT_MESSAGES.default;
  const displayTitle = title || messages.title;
  const displaySubtitle = subtitle || messages.subtitle;

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
      // Navigate back to home when dismissed without signing in
      router.push('/');
    }
  }, [onClose, router]);

  const handleSignIn = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onClose();
    // Small delay to let sheet dismiss smoothly
    setTimeout(() => {
      onSignIn();
    }, 150);
  }, [onClose, onSignIn]);

  const handleDismiss = useCallback(() => {
    onClose();
    router.push('/');
  }, [onClose, router]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.blkBg, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.blkText2, width: Sizes.bubble }}
      containerStyle={{ zIndex: 100 }}
    >
      <BottomSheetView style={styles.content}>
        {/* Doodle Background */}
        <AuthDoodle />

        {/* Header with Logo */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.header}
        >
          <RevvupLogo 
            size={Sizes.iconXl} 
            color={colors.blkText}
          />
        </Animated.View>

        {/* Title & Subtitle */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.textContent}
        >
          <Heading size="medium" style={[styles.title, { color: colors.blkText }]}>
            {displayTitle}
          </Heading>
          <Supporting size="small" style={[styles.subtitle, { color: colors.blkText2 }]}>
            {displaySubtitle}
          </Supporting>
        </Animated.View>

        {/* Actions */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.actions}
        >
          <HapticPressable
            onPress={handleSignIn}
            style={({ pressed }) => [{
              height: Sizes.actionButtonLg,
              borderRadius: Radius.lg,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <Data size="medium" style={{ color: colors.primaryFg }}>
              Sign In
            </Data>
          </HapticPressable>

          <HapticPressable
            onPress={handleDismiss}
            style={({ pressed }) => [{
              height: Sizes.actionButtonLg,
              borderRadius: Radius.lg,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              borderWidth: 1,
              borderColor: colors.blkBorder,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Data size="medium" style={{ color: colors.blkText2 }}>
              Maybe Later
            </Data>
          </HapticPressable>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  textContent: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: {
    marginTop: Spacing['2xl'],
    gap: Spacing.md,
  },
});

export type { AuthSheetProps };
