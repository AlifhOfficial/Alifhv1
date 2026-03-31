/**
 * Seller About Section
 * 
 * Displays seller description in a card wrapper following profile Section pattern.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/theme';
import type { SellerContactColors } from './types';

interface SellerAboutProps extends SellerContactColors {
  description: string;
  onReadMore?: () => void;
}

export const SellerAbout = memo(function SellerAbout({
  description,
  onReadMore,
  colors,
}: SellerAboutProps) {
  if (!description) return null;

  const shouldTruncate = description.length > 180;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(350)}
    >
      <HapticPressable
        onPress={onReadMore}
        disabled={!onReadMore}
        style={[styles.content, { backgroundColor: colors.surface }]}
      >
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>About</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.body}>
        <Text variant="subhead" tone="secondary" numberOfLines={5}>
          {description}
        </Text>
        {shouldTruncate && onReadMore && (
          <Text variant="subhead" tone="primary" style={styles.readMore}>
            Read more
          </Text>
        )}
        </View>
      </HapticPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  content: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  readMore: {
    marginTop: Spacing.xs,
  },
});
