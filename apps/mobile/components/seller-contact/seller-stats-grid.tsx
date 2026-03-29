/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 * Follows listings component patterns for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Sizes } from '@/constants/theme';
import { CheckCircle2, Circle } from 'lucide-react-native';
import type { SellerStatsGridProps } from './types';

export const SellerStatsGrid = memo(function SellerStatsGrid({
  seller,
  listingsCount,
  colors,
}: SellerStatsGridProps) {
  // Only show for private sellers
  if (seller.isDealer) return null;

  return (
    <View style={[localStyles.grid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
      {/* Email Verified */}
      <View style={localStyles.item}>
        <Text variant="caption" tone="muted" uppercase>EMAIL</Text>
        <View style={localStyles.verifiedRow}>
          {seller.emailVerified ? (
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
          ) : (
            <Circle size={Sizes.iconXs} color={colors.labelQuaternary} />
          )}
          <Text variant="bodySm" style={{ color: seller.emailVerified ? colors.success : colors.labelQuaternary }}>
            {seller.emailVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>

      {/* Phone Verified */}
      <View style={localStyles.item}>
        <Text variant="caption" tone="muted" uppercase>PHONE</Text>
        <View style={localStyles.verifiedRow}>
          {seller.phoneVerified ? (
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
          ) : (
            <Circle size={Sizes.iconXs} color={colors.labelQuaternary} />
          )}
          <Text variant="bodySm" style={{ color: seller.phoneVerified ? colors.success : colors.labelQuaternary }}>
            {seller.phoneVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <Text variant="caption" tone="muted" uppercase>LISTINGS</Text>
        <Text variant="body">{listingsCount}</Text>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <Text variant="caption" tone="muted" uppercase>RESPONSE</Text>
        <Text variant="body" tone="muted">—</Text>
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
