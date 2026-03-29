/**
 * Auth Required Empty State - Revvup Design System
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A premium card-style empty state for screens that require authentication.
 * Uses bg3.png as image header with content below.
 * 
 * USAGE:
 *    * 
 *   <AuthRequiredEmptyState
 *     title="Sign in to message"
 *     subtitle="Connect with buyers and sellers on Revvup"
 *   />
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Text } from './text';
import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Image, Platform, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { HapticPressable } from './haptic-pressable';

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = Spacing['2xl'];
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
const IMAGE_HEIGHT = 180;

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface AuthRequiredEmptyStateProps {
  /** Title text */
  title: string;
  /** Subtitle text */
  subtitle: string;
  /** Icon is no longer used - kept for backwards compatibility */
  icon?: React.ReactNode;
}

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export const AuthRequiredEmptyState = memo(function AuthRequiredEmptyState({
  title,
  subtitle,
}: AuthRequiredEmptyStateProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { openAuthFlow } = useAuth();

  const handleSignIn = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    openAuthFlow();
  }, [openAuthFlow]);

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn.duration(400)} 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* Text */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.textContent}>
            <Text variant="subheading">
              {title}
            </Text>
            <Text variant="bodySm" style={styles.subtitle} tone="secondary">
              {subtitle}
            </Text>
          </Animated.View>

          {/* Image - Centered */}
          <View style={styles.imageContainer}>
            <Image
              source={require('@/assets/images/revv.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {/* Sign In */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.actions}>
            <HapticPressable
              haptic="medium"
              onPress={handleSignIn}
              style={styles.signInRow}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm }}
            >
              <Text variant="subheading" style={{ color: colors.label }}>Sign In</Text>
              <View style={[styles.glassBubble, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ArrowRight size={Sizes.iconXs} color={colors.label} strokeWidth={2} />
              </View>
            </HapticPressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
});

// ═══════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Spacing.xs },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.md,
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    marginTop: Spacing.sm,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  glassBubble: {
    width: Sizes.bubbleXs,
    height: Sizes.bubbleXs,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
