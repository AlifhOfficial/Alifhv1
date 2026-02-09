/**
 * Seller Listings Section
 * 
 * Shows other listings from this seller.
 */

import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Car, ChevronRight } from 'lucide-react-native';

import type { SellerListingsProps } from './types';
import { formatPrice } from './utils';
import { styles } from './styles';

export const SellerListings = memo(function SellerListings({
  listings,
  totalCount,
  onViewListing,
  onViewAll,
  colors,
}: SellerListingsProps) {
  if (listings.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>MORE FROM THIS SELLER</Text>
      
      <View style={styles.listingsRow}>
        {listings.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.listingItem, { backgroundColor: colors.surface }]}
            onPress={() => onViewListing(item.id)}
          >
            <View style={[styles.listingThumb, { backgroundColor: colors.surfaceSecondary }]}>
              {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} contentFit="cover" />
              ) : (
                <Car size={20} color={colors.textTertiary} />
              )}
            </View>
            <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>
              {item.year} {item.make}
            </Text>
            <Text style={[styles.listingModel, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.model}
            </Text>
            <Text style={[styles.listingPrice, { color: colors.text }]}>
              {formatPrice(item.price)}
            </Text>
          </Pressable>
        ))}
      </View>
      
      {/* View All Footer */}
      <Pressable
        style={[styles.viewAllBtn, { borderColor: colors.border }]}
        onPress={onViewAll}
      >
        <Text style={[styles.viewAllBtnText, { color: colors.text }]}>
          View All {totalCount} Listings
        </Text>
        <ChevronRight size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
});
