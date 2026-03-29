/**
 * Welcome Screen - First touch point
 * Premium OLED black design with Apple-style logo reveal
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';

import { Colors, Spacing, Sizes, Radius } from '@/constants/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSkip?: () => void;
}

// Derived sizes from theme tokens
const LOGO_SIZE = Sizes.avatarLg + Spacing.lg; // 64

const colors = Colors.dark;

export function WelcomeScreen({ onGetStarted, onSignIn, onSkip }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.black, paddingTop: insets.top }]}>
      {/* Main content - Logo centered with CTAs below */}
      <View style={styles.mainSection}>
        {/* Logo - centered */}
        <View style={styles.logoWrapper}>
          <Animated.View entering={FadeIn.duration(800)}>
            <Image
              source={require('@/assets/images/revv.png')}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE, tintColor: colors.white }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* CTAs below logo - left aligned */}
        <View style={styles.ctaSection}>
          {/* Get Started with glass arrow bubble */}
          <Animated.View entering={FadeInUp.delay(600).duration(400)}>
            <HapticPressable
              onPress={onGetStarted}
              style={styles.getStartedRow}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm }}
            >
              <Text variant="title3Emphasized" style={{ color: colors.white }}>Get Started</Text>
              <View style={[styles.glassBubble, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ArrowRight size={Sizes.iconXs} color={colors.white} strokeWidth={2} />
              </View>
            </HapticPressable>
          </Animated.View>

          {/* Sign In */}
          <Animated.View entering={FadeInUp.delay(700).duration(400)}>
            <HapticPressable
              onPress={onSignIn}
              hitSlop={{ top: Spacing.sm, bottom: Spacing.sm, left: Spacing.sm, right: Spacing.sm }}
            >
              <Text variant="title3Emphasized" tone="secondary">Sign In</Text>
            </HapticPressable>
          </Animated.View>
        </View>
      </View>

      {/* Skip - Bottom center */}
      {onSkip && (
        <Animated.View 
          entering={FadeInUp.delay(800).duration(300)}
          style={[styles.skipSection, { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing['2xl']) }]}
        >
          <HapticPressable
            onPress={onSkip}
            hitSlop={{ top: Spacing.md, bottom: Spacing.md, left: Spacing.xl, right: Spacing.xl }}
          >
            <Text variant="body" tone="muted">Skip</Text>
          </HapticPressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  logoWrapper: {
    alignItems: 'flex-start',
  },
  ctaSection: {
    marginTop: Spacing['3xl'],
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },
  getStartedRow: {
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
  skipSection: {
    alignItems: 'center',
  },
});
