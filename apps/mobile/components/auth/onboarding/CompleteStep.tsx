/**
 * Complete Step - Clean success screen with confetti
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Display, Body, ButtonText } from '@/components/ui';
import type { OnboardingData } from './types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 50;

// Confetti colors
const CONFETTI_COLORS = [
  '#0066FF', // primary blue
  '#00D4AA', // teal
  '#FF6B6B', // coral
  '#FFD93D', // yellow
  '#6BCB77', // green
  '#9B59B6', // purple
];

function ConfettiPiece({ index }: { index: number }) {
  const startX = Math.random() * SCREEN_WIDTH;
  const size = 6 + Math.random() * 6;
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const delay = index * 20;
  const fallDuration = 2500 + Math.random() * 1000;
  
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(200)}
      style={[
        styles.confetti,
        {
          left: startX,
          top: -20 + Math.random() * SCREEN_HEIGHT * 0.3,
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: size / 4,
        },
      ]}
    />
  );
}

interface CompleteStepProps {
  data: OnboardingData;
  onComplete: () => void;
}

export function CompleteStep({ data, onComplete }: CompleteStepProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Confetti */}
      <View style={styles.confettiContainer}>
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        {/* Success Check */}
        <View style={styles.iconSection}>
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Check size={40} color={colors.primaryForeground} strokeWidth={3} />
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Display size="large" style={styles.title}>
            You're in, {data.name}.
          </Display>
          
          <Body size="large" tone="secondary" style={styles.subtitle}>
            Your account is ready to go.
          </Body>
        </View>

        {/* CTA */}
        <View style={styles.actions}>
          <HapticPressable
            onPress={onComplete}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
            ]}
          >
            <ButtonText style={{ color: colors.primaryForeground }}>
              Get Started
            </ButtonText>
          </HapticPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: -20,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
