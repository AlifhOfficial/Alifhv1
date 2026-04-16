/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status.
 * Follows profile/settings card pattern for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import type { SellerStatsGridProps } from './types';

export const SellerStatsGrid = memo(function SellerStatsGrid({
  seller,
  colors,
}: SellerStatsGridProps) {
  if (seller.isDealer) return null;

  const stats = [
    { label: 'Email', verified: seller.emailVerified },
    { label: 'Phone', verified: seller.phoneVerified },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(350)}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {stats.map((stat, index) => (
          <View key={stat.label}>
            <View style={styles.row}>
              <Text variant="subhead" tone="secondary" style={styles.rowLabel}>{stat.label}</Text>
              <View style={styles.valueRow}>
                {stat.verified ? (
                  <CheckCircle2 size={Sizes.iconXs} color={colors.success} strokeWidth={Stroke.icon} />
                ) : (
                  <Circle size={Sizes.iconXs} color={colors.labelQuaternary} strokeWidth={Stroke.icon} />
                )}
                <Text variant="subhead" style={{ color: stat.verified ? colors.success : colors.labelQuaternary }}>
                  {stat.verified ? 'Verified' : 'Unverified'}
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowLabel: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
});
