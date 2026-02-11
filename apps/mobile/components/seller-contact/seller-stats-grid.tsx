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
import type { SellerStatsGridProps } from './types';

const ICON_SIZE = 18;

export const SellerStatsGrid = memo(function SellerStatsGrid({
  seller,
  listingsCount,
  colors,
}: SellerStatsGridProps) {
  // Only show for private sellers
  if (seller.isDealer) return null;

  const verificationStatus = seller.emailVerified && seller.phoneVerified 
    ? 'Verified' 
    : seller.emailVerified 
    ? 'Email' 
    : seller.phoneVerified 
    ? 'Phone' 
    : 'N/A';

  const isVerified = seller.emailVerified || seller.phoneVerified;

  return (
    <View style={[localStyles.grid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
      {/* Verified Status */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">STATUS</Label>
        <Data size="medium">{verificationStatus}</Data>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">LISTINGS</Label>
        <Data size="medium">{listingsCount}</Data>
      </View>

      {/* Response Time placeholder */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">RESPONSE</Label>
        <Data size="medium" tone="muted">—</Data>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <Label size="small" tone="muted">RATE</Label>
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
});
