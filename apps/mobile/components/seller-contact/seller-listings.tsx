/**
 * Seller Listings Section
 * 
 * Shows other listings from this seller.
 * Two-column grid layout with proper card design.
 */

import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';

import { Label, Data, Supporting } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import type { SellerListingsProps } from './types';
import { formatPrice, formatMileage } from './utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - (Spacing.lg * 2) - CARD_GAP) / 2;

export const SellerListings = memo(function SellerListings({
  listings,
  totalCount,
  onViewListing,
  onViewAll,
  colors,
}: SellerListingsProps) {
  if (listings.length === 0) return null;

  return (
    <View style={localStyles.section}>
      <Label size="small" tone="muted">MORE FROM THIS SELLER</Label>
      
      {/* Two-column grid */}
      <View style={localStyles.grid}>
        {listings.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onViewListing(item.id)}
            style={localStyles.card}
          >
            <Image 
              source={{ uri: item.thumbnail ?? undefined }} 
              style={[localStyles.thumb, { backgroundColor: colors.surfaceSecondary }]}
              contentFit="cover" 
            />
            
            <View style={localStyles.content}>
              <Data size="small" numberOfLines={1}>
                {item.year} {item.make} {item.model}
              </Data>
              <Supporting size="mini">
                {formatMileage(item.mileage)} · {formatPrice(item.price)}
              </Supporting>
            </View>
          </Pressable>
        ))}
      </View>
      
      {/* View All button */}
      {totalCount > 4 && (
        <Pressable
          onPress={onViewAll}
          style={localStyles.viewAllRow}
        >
          <Data size="medium" tone="primary">
            View All {totalCount} Listings
          </Data>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: Radius.md,
  },
  content: {
    paddingTop: Spacing.sm,
    gap: 2,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
