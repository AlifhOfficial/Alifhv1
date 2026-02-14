/**
 * AuthSheet - Premium auth sheet for unauthenticated users
 * Uses @gorhom/bottom-sheet modal with the RevvupLogo
 * Shown when user tries to access features requiring authentication
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LogIn } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, ButtonText } from '@/components/ui';
import { RevvupLogoAnimated } from '@/components/ui/loaders/revvup-logo';

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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
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
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['2xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <BottomSheetView style={styles.container}>
        {/* Logo section */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.logoContainer}
        >
          <View style={[styles.logoBackground, { backgroundColor: colors.backgroundSecondary }]}>
            <RevvupLogoAnimated 
              size={48} 
              color={colors.text}
              animation="breathe"
              duration={2000}
            />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.content}
        >
          <Heading size="medium" style={styles.title}>
            {displayTitle}
          </Heading>
          <Body size="small" tone="secondary" style={styles.subtitle}>
            {displaySubtitle}
          </Body>
        </Animated.View>

        {/* Sign in button */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.buttonContainer}
        >
          <HapticPressable
            onPress={handleSignIn}
            style={({ pressed }) => [
              styles.signInButton,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <LogIn size={Sizes.iconSm} color={colors.primaryForeground} strokeWidth={2} />
            <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
              Sign In
            </ButtonText>
          </HapticPressable>

          {/* Skip/Cancel option */}
          <HapticPressable
            onPress={onClose}
            hitSlop={Spacing.md}
            style={styles.skipButton}
          >
            <Body size="small" tone="tertiary">
              Maybe later
            </Body>
          </HapticPressable>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  skipButton: {
    paddingVertical: Spacing.xs,
  },
});

export type { AuthSheetProps };
