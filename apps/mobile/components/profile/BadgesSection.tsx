/**
 * Badges Section Component
 * Shows earned badges or empty state
 */

import React from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Label, Body, Supporting, ButtonText } from '@/components/ui';
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
              <Label size="small" style={styles.badgeText}>{badge}</Label>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Body size="medium" tone="secondary" style={styles.emptyTitle}>
            No badges yet
          </Body>
          <Supporting size="small" tone="muted" style={styles.emptySubtitle}>
            Complete activities to earn badges
          </Supporting>
          <Pressable
            onPress={handleLearnMore}
            style={({ pressed }) => [
              styles.learnMoreBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ButtonText size="small" tone="primary">
              Learn more
            </ButtonText>
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
    fontFamily: 'Inter_500Medium',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  learnMoreBtn: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
