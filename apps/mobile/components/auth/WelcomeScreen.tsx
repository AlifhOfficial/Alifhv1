import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

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
      <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/Revvup-wordmark-white.png')}
            style={styles.wordmark}
            resizeMode="contain"
          />
        </View>

        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/revvupab.png')}
            style={styles.heroArtwork}
            resizeMode="contain"
          />

          <Text variant="title1Emphasized" style={styles.heroTitle}>
            Sell smarter.
          </Text>

          <Text variant="callout" style={styles.heroSubtitle}>
            Free listings, real buyers, no paid boosts.
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing['2xl']) }]}>
          <HapticPressable onPress={onGetStarted} style={({ pressed }) => [styles.primaryAction, pressed && styles.linkPressed]}>
            <Text variant="title2Emphasized" style={styles.primaryActionText}>
              Create Account
            </Text>
            <ArrowRight size={Sizes.iconSm} color="#FFFFFF" strokeWidth={2.4} />
          </HapticPressable>

          <HapticPressable onPress={onSignIn} style={({ pressed }) => [styles.secondaryAction, pressed && styles.linkPressed]}>
            <Text variant="headline" style={styles.secondaryActionText}>
              Sign in
            </Text>
          </HapticPressable>

          {onSkip ? (
            <HapticPressable onPress={onSkip} style={({ pressed }) => [styles.skipAction, pressed && styles.skipPressed]}>
              <Text variant="subhead" style={styles.skipText}>
                Explore first
              </Text>
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
  header: {
    gap: Spacing.md,
  },
  wordmark: {
    width: 188,
    height: 54,
  },
  hero: {
    gap: Spacing.lg,
    paddingTop: Spacing.md,
  },
  heroArtwork: {
    width: '100%',
    height: 250,
  },
  heroTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    textAlign: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
  footer: {
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    minHeight: Sizes.actionButtonLg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: '#0A84FF',
    borderRadius: Radius.full,
    borderCurve: 'continuous',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  secondaryAction: {
    alignSelf: 'flex-start',
  },
  secondaryActionText: {
    color: 'rgba(255,255,255,0.82)',
  },
  skipAction: {
    minHeight: Sizes.actionButtonMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.58)',
  },
  linkPressed: {
    opacity: 0.66,
  },
  skipPressed: {
    opacity: 0.72,
  },
});
