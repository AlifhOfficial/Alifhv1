/**
 * Badges Section Component
 * Shows earned badges or empty state
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';

import { Data, Body, Supporting, ButtonText } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { Section } from './Section';
import type { ThemeColors } from './types';

interface BadgesSectionProps {
  badges: string[];
  colors: ThemeColors;
  onLearnMore?: () => void;
}

export function BadgesSection({ badges, colors, onLearnMore }: BadgesSectionProps) {
  const handleLearnMore = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLearnMore?.();
  };

  return (
    <Section title="Awards & Badges" colors={colors} delay={300}>
      {badges.length > 0 ? (
        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <View
              key={index}
              style={[styles.badge, { backgroundColor: colors.surface2 }]}
            >
              <Data size="bodySm" style={styles.badgeText}>{badge}</Data>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Body size="body" tone="secondary" style={styles.emptyTitle}>
            No badges yet
          </Body>
          <Body size="body" tone="muted" style={styles.emptySubtitle}>
            Complete activities to earn badges
          </Body>
          <HapticPressable
            onPress={handleLearnMore}
            style={({ pressed }) => [
              styles.learnMoreBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ButtonText size="bodySm" tone="primary">
              Learn more
            </ButtonText>
          </HapticPressable>
        </View>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  badgeText: {
    // Typography handled by <Label> component
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    // Typography handled by <Body> component
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  learnMoreBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
});
