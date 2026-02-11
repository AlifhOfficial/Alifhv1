/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Label, Data } from '@/components/ui';
import { CheckCircle2, Circle } from 'lucide-react-native';
import type { SellerStatsGridProps } from './types';

const ICON_SIZE = 16;

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
        <Label size="small" tone="muted">EMAIL</Label>
        <View style={localStyles.verifiedRow}>
          {seller.emailVerified ? (
            <CheckCircle2 size={ICON_SIZE} color="#22c55e" />
          ) : (
            <Circle size={ICON_SIZE} color={colors.textMuted} />
          )}
          <Data size="small" style={{ color: seller.emailVerified ? '#22c55e' : colors.textMuted }}>
            {seller.emailVerified ? 'Verified' : 'Unverified'}
          </Data>
        </View>
      </View>

      {/* Phone Verified */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">PHONE</Label>
        <View style={localStyles.verifiedRow}>
          {seller.phoneVerified ? (
            <CheckCircle2 size={ICON_SIZE} color="#22c55e" />
          ) : (
            <Circle size={ICON_SIZE} color={colors.textMuted} />
          )}
          <Data size="small" style={{ color: seller.phoneVerified ? '#22c55e' : colors.textMuted }}>
            {seller.phoneVerified ? 'Verified' : 'Unverified'}
          </Data>
        </View>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">LISTINGS</Label>
        <Data size="medium">{listingsCount}</Data>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">RESPONSE</Label>
        <Data size="medium" tone="muted">—</Data>
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
    gap: 4,
  },
});
