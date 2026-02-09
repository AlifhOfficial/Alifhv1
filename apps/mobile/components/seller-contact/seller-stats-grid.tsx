/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2, Car, Clock, MessageCircle } from 'lucide-react-native';

import { Spacing } from '@/constants/theme';
import { Label, Data } from '@/components/ui';
import type { SellerStatsGridProps } from './types';

const ICON_SIZE = 14;

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
    <View style={[localStyles.grid, { borderColor: colors.border }]}>
      {/* Verified Status */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <CheckCircle2 
            size={ICON_SIZE} 
            color={isVerified ? colors.success : colors.iconMuted} 
          />
          <Label size="badge" tone="muted">STATUS</Label>
        </View>
        <Data size="small">{verificationStatus}</Data>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <Car size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="badge" tone="muted">LISTINGS</Label>
        </View>
        <Data size="small">{listingsCount}</Data>
      </View>

      {/* Response Time placeholder */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <Clock size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="badge" tone="muted">RESPONSE</Label>
        </View>
        <Data size="small" tone="muted">N/A</Data>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <MessageCircle size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="badge" tone="muted">RATE</Label>
        </View>
        <Data size="small" tone="muted">N/A</Data>
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  item: {
    width: '45%',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
