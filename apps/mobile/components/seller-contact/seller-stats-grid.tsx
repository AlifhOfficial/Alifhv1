/**
 * Seller Stats Grid
 * 
 * Stats for private sellers: verification status, listings count, response metrics.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2, Car, Clock, MessageCircle } from 'lucide-react-native';

import type { SellerStatsGridProps } from './types';
import { styles } from './styles';

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

  return (
    <View style={[styles.statsGrid, { borderColor: colors.border }]}>
      {/* Verified Status */}
      <View style={styles.statItem}>
        <View style={styles.statHeader}>
          <CheckCircle2 
            size={14} 
            color={seller.emailVerified || seller.phoneVerified ? colors.success : colors.textTertiary} 
          />
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>STATUS</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {verificationStatus}
        </Text>
      </View>

      {/* Listings Count */}
      <View style={styles.statItem}>
        <View style={styles.statHeader}>
          <Car size={14} color={colors.textTertiary} />
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>LISTINGS</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>
          {listingsCount}
        </Text>
      </View>

      {/* Response Time placeholder */}
      <View style={styles.statItem}>
        <View style={styles.statHeader}>
          <Clock size={14} color={colors.textTertiary} />
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>RESPONSE</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.textTertiary }]}>N/A</Text>
      </View>

      {/* Response Rate placeholder */}
      <View style={styles.statItem}>
        <View style={styles.statHeader}>
          <MessageCircle size={14} color={colors.textTertiary} />
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>RATE</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.textTertiary }]}>N/A</Text>
      </View>
    </View>
  );
});
