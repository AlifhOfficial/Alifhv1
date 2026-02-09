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

import { Label, Heading, Data, Supporting, ButtonText } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import type { SellerListingsProps } from './types';
import { formatPrice, formatMileage } from './utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.md;
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
      <Label size="medium" tone="muted">MORE FROM THIS SELLER</Label>
      
      {/* Two-column grid */}
      <View style={localStyles.grid}>
        {listings.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onViewListing(item.id)}
            style={({ pressed }) => [
              localStyles.card,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              }
            ]}
          >
            <Image 
              source={{ uri: item.thumbnail ?? undefined }} 
              style={[localStyles.thumb, { backgroundColor: colors.surfaceSecondary }]}
              contentFit="cover" 
            />
            
            <View style={localStyles.content}>
              <Heading size="mini" numberOfLines={1}>
                {item.year} {item.make} {item.model}
              </Heading>
              <Supporting size="small">
                {formatMileage(item.mileage)}
              </Supporting>
              <Data size="medium" tone="primary">
                {formatPrice(item.price)}
              </Data>
            </View>
          </Pressable>
        ))}
      </View>
      
      {/* View All button */}
      {totalCount > 4 && (
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => [
            localStyles.viewAllBtn,
            { 
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            }
          ]}
        >
          <ButtonText size="medium">
            View All {totalCount} Listings
          </ButtonText>
          <ChevronRight size={18} color={colors.text} />
        </Pressable>
      )}
    </View>
  );
});

const localStyles = StyleSheet.create({
  section: {
    gap: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  content: {
    padding: Spacing.md,
    gap: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
});
