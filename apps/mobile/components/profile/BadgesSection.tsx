/**
 * Badges Section Component
 * Shows earned badges or empty state
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
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
              <Text style={[styles.badgeText, { color: colors.text }]}>{badge}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            No badges yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            Complete activities to earn badges
          </Text>
          <Pressable
            onPress={handleLearnMore}
            style={({ pressed }) => [
              styles.learnMoreBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.learnMoreText, { color: colors.primary }]}>
              Learn more
            </Text>
          </Pressable>
        </View>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontFamily: 'Inter_500Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    fontSize: Typography.labelSmall.fontSize,
    lineHeight: Typography.helper.lineHeight,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  learnMoreBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  learnMoreText: {
    ...Typography.buttonSmall,
  },
});
