import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticPressable, Text } from '@/components/ui';
import { Layout, Radius, Sizes, Spacing } from '@/constants/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSkip?: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn, onSkip }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing['2xl'], paddingBottom: Math.max(insets.bottom + Spacing.xl, Spacing['3xl']) }]}>

        {/* Logo */}
        <Image
          source={require('@/assets/images/Revvup-wordmark-white.png')}
          style={styles.wordmark}
          resizeMode="contain"
        />

        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/revvupab.png')}
            style={styles.heroArtwork}
            resizeMode="contain"
          />
          <Text variant="largeTitleEmphasized" style={styles.heroTitle}>
            Buy and sell{'\n'}cars in the UAE.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <HapticPressable onPress={onGetStarted} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.82 }]}>
            <Text variant="bodyEmphasized" style={styles.primaryBtnText}>Create Account</Text>
          </HapticPressable>

          <HapticPressable onPress={onSignIn} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.6 }]}>
            <Text variant="body" style={styles.secondaryBtnText}>Sign In</Text>
          </HapticPressable>

          {onSkip ? (
            <HapticPressable onPress={onSkip} style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.5 }]}>
              <Text variant="footnote" style={styles.skipText}>Explore without account</Text>
            </HapticPressable>
          ) : null}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    justifyContent: 'space-between',
  },
  wordmark: {
    width: 120,
    height: 36,
  },
  hero: {
    gap: Spacing['2xl'],
    alignItems: 'flex-start',
  },
  heroArtwork: {
    width: '100%',
    height: 220,
  },
  heroTitle: {
    color: '#FFFFFF',
  },
  actions: {
    gap: Spacing.md,
  },
  primaryBtn: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    borderCurve: 'continuous',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  primaryBtnText: {
    color: '#050505',
  },
  secondaryBtn: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.82)',
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: 'rgba(255,255,255,0.4)',
  },
});

