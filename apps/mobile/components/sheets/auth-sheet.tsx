/**
 * AuthSheet - Premium auth sheet for unauthenticated users
 * Uses @gorhom/bottom-sheet modal with the Revvup wordmark
 * Shown when user tries to access features requiring authentication
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, ZIndex, SheetSnapPoints } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

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
    }
  }, [onClose]);

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
  }, [onClose]);

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
      snapPoints={SheetSnapPoints.singleSm}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleIndicatorStyle={{ backgroundColor: colors.labelSecondary, width: Sizes.bubble }}
      containerStyle={{ zIndex: ZIndex.modal }}
    >
      <BottomSheetView style={styles.content}>
        {/* Title & Subtitle */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.textContent}
        >
          <Text variant="title3" style={[styles.title, { color: colors.label }]}> 
            {displayTitle}
          </Text>
          <Text variant="subhead" style={[styles.subtitle, { color: colors.labelSecondary }]} tone="secondary">
            {displaySubtitle}
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.actions}
        >
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
            <Text variant="subhead" style={{ color: colors.primaryForeground }}>
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
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <Text variant="subhead" style={{ color: colors.labelSecondary }}>
              Maybe Later
            </Text>
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
    paddingHorizontal: Spacing['3xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    overflow: 'hidden',
    gap: Spacing.xl,
  },
  textContent: {
    alignItems: 'center',
    gap: Spacing.sm,
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

export type { AuthSheetProps };
