/**
 * Seller Listings Section
 * 
 * Shows other listings from this seller.
 * Uses CarCardList for consistent card design.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Spacing, Sizes } from '@/constants/theme';
import { CarCardList } from '@/components/cards/car-card-list';
import type { SellerListingsProps } from './types';

export const SellerListings = memo(function SellerListings({
  listings,
  totalCount,
  onViewListing,
  onViewAll,
  colors,
}: SellerListingsProps) {
  if (listings.length === 0) return null;

  const handlePress = useCallback((id: string) => {
    onViewListing(id);
  }, [onViewListing]);

  return (
    <View style={localStyles.section}>
      <Text variant="label" tone="muted" uppercase>MORE FROM THIS SELLER</Text>
      
      {/* Listings list */}
      <View style={localStyles.list}>
        {listings.slice(0, 4).map((item) => (
          <CarCardList
            key={item.id}
            id={item.id}
            make={item.make}
            model={item.model}
            year={item.year}
            price={item.price}
            mileage={item.mileage}
            emirate=""
            thumbnail={item.thumbnail}
            isBlkListing={item.isBlkListing}
            onPress={handlePress}
          />
        ))}
      </View>
      
      {/* View All button */}
      {totalCount > 4 && (
        <HapticPressable
          onPress={onViewAll}
          style={localStyles.viewAllRow}
        >
          <Text variant="body" tone="primary">
            View All {totalCount} Listings
          </Text>
          <ChevronRight size={Sizes.iconXs} color={colors.primary} />
        </HapticPressable>
      )}
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  list: {
    gap: Spacing.xs,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
