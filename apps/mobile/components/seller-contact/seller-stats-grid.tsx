/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Sizes } from '@/constants/theme';
import { Label, Data } from '@/components/ui';
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
        <Label size="caption" tone="muted">EMAIL</Label>
        <View style={localStyles.verifiedRow}>
          {seller.emailVerified ? (
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
          ) : (
            <Circle size={Sizes.iconXs} color={colors.labelQuaternary} />
          )}
          <Data size="bodySm" style={{ color: seller.emailVerified ? colors.success : colors.labelQuaternary }}>
            {seller.emailVerified ? 'Verified' : 'Unverified'}
          </Data>
        </View>
      </View>

      {/* Phone Verified */}
      <View style={localStyles.item}>
        <Label size="caption" tone="muted">PHONE</Label>
        <View style={localStyles.verifiedRow}>
          {seller.phoneVerified ? (
            <CheckCircle2 size={Sizes.iconXs} color={colors.success} />
          ) : (
            <Circle size={Sizes.iconXs} color={colors.labelQuaternary} />
          )}
          <Data size="bodySm" style={{ color: seller.phoneVerified ? colors.success : colors.labelQuaternary }}>
            {seller.phoneVerified ? 'Verified' : 'Unverified'}
          </Data>
        </View>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <Label size="caption" tone="muted">LISTINGS</Label>
        <Data size="body">{listingsCount}</Data>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <Label size="caption" tone="muted">RESPONSE</Label>
        <Data size="body" tone="muted">—</Data>
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
