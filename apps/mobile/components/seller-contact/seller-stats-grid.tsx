/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2, Car, Clock, MessageCircle } from 'lucide-react-native';

import { Spacing, Radius } from '@/constants/theme';
import { Label, Data, Heading } from '@/components/ui';
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
    <View style={[localStyles.grid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Verified Status */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <CheckCircle2 
            size={ICON_SIZE} 
            color={isVerified ? colors.success : colors.iconMuted} 
          />
          <Label size="small" tone="muted">STATUS</Label>
        </View>
        <Data size="medium">{verificationStatus}</Data>
      </View>

      {/* Listings Count */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <Car size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="small" tone="muted">LISTINGS</Label>
        </View>
        <Data size="medium">{listingsCount}</Data>
      </View>

      {/* Response Time placeholder */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <Clock size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="small" tone="muted">RESPONSE</Label>
        </View>
        <Data size="medium" tone="muted">N/A</Data>
      </View>

      {/* Response Rate placeholder */}
      <View style={localStyles.item}>
        <View style={localStyles.header}>
          <MessageCircle size={ICON_SIZE} color={colors.iconMuted} />
          <Label size="small" tone="muted">RATE</Label>
        </View>
        <Data size="medium" tone="muted">N/A</Data>
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.lg,
  },
  item: {
    width: '45%',
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
