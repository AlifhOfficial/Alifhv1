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

import { Spacing, Radius, Sizes } from '@/constants/theme';
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
    <Animated.View entering={FadeInDown.delay(250).duration(350)}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Section header */}
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>MORE FROM THIS SELLER</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

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
        {totalCount > 4 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <HapticPressable onPress={onViewAll} style={styles.viewAllRow}>
              <Text variant="subhead" tone="primary">View all {totalCount} listings</Text>
              <ChevronRight size={Sizes.iconSm} color={colors.primary} />
            </HapticPressable>
          </>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
