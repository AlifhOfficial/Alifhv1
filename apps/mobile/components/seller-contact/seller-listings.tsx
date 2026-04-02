/**
 * Seller Listings Section
 *
 * Shows other listings from this seller.
 * Follows profile/settings card pattern for consistency.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

import { Spacing, Sizes, Radius } from '@/constants/theme';
import { CarCardList } from '@/components/cards/car-card-list';
import type { SellerListingsProps } from './types';

export const SellerListings = memo(function SellerListings({
  listings,
  onViewListing,
  onViewAll,
  colors,
}: SellerListingsProps) {
  const handlePress = useCallback((id: string) => {
    onViewListing(id);
  }, [onViewListing]);

  if (listings.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(250).duration(350)} style={styles.container}>
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}> 
        <View style={styles.headerRow}>
          <Text variant="subhead">More from this seller</Text>
        </View>
      </View>

      {/* Listing cards */}
      <View style={styles.list}>
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

      {/* View All row */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <HapticPressable onPress={onViewAll} style={styles.viewAllRow}>
        <Text variant="subhead" tone="primary">View all listings</Text>
        <ChevronRight size={Sizes.iconSm} color={colors.primary} />
      </HapticPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  list: {
    gap: Spacing.sm,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
});
