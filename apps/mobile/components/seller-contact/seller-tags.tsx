/**
 * Seller Tags Section
 * 
 * Reusable tag display for interests wrapped in a card.
 * Follows profile/settings card pattern for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/theme';
import type { SellerTagsProps } from './types';

export const SellerTags = memo(function SellerTags({ tags, label, colors }: SellerTagsProps) {
  if (tags.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(350)}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>{label}</Text>
        </View>
        {tags.map((tag, index) => (
          <React.Fragment key={`tag-${index}`}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text variant="subhead">{tag}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
