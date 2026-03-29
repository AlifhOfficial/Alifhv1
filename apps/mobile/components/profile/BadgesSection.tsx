/**
 * Badges Section Component
 * Shows earned badges or empty state
 */

import { Text, HapticPressable } from '@/components/ui';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

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
              style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text variant="subhead" style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text variant="body" tone="secondary" style={styles.emptyTitle}>
            No badges yet
          </Text>
          <Text variant="body" tone="muted" style={styles.emptySubtitle}>
            Complete activities to earn badges
          </Text>
          <HapticPressable
            onPress={handleLearnMore}
            style={({ pressed }) => [
              styles.learnMoreBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text variant="subhead" tone="primary">
              Learn more
            </Text>
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
    // Typography handled by <Text variant="footnoteEmphasized" uppercase> component
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyTitle: {
    // Typography handled by <Text variant="body"> component
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
