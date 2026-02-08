/**
 * Car Card Detailed Mobile (CarCardDetailedM) - Revvup Design System
 * 
 * Full listing detail view - composes modular components.
 * Clean, gesture-based gallery with 40% viewport height.
 * 
 * "Talk to Seller" navigates to a dedicated seller screen
 * for better space utilization and progressive disclosure.
 */

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui';
import { ListingDetailedData, SellerData } from '@/lib/api';

import {
  ImageGallery,
  ImageGallerySkeleton,
  ListingHeader,
  QuickStats,
  ListingDescription,
  ListingSpecs,
  ListingFeatures,
  SellerCard,
  ListingTimestamp,
} from '@/components/listings';

// ============================================================================
// PROPS
// ============================================================================

export interface CarCardDetailedMProps {
  listing: ListingDetailedData;
  sellerData: SellerData;
  listingId: string;
  isFavorite?: boolean;
  onFavoritePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CarCardDetailedM = memo(function CarCardDetailedM({
  listing,
  sellerData,
  listingId,
  isFavorite = false,
  onFavoritePress,
  onSharePress,
}: CarCardDetailedMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const isBlk = listing.isBlkListing;
  const bgColor = isBlk ? colors.blkBackground : colors.background;

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Navigate to the dedicated seller contact screen
  const handleTalkToSeller = useCallback(() => {
    router.push(`/seller-contact/${listingId}`);
  }, [router, listingId]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Image Gallery - 40% of viewport */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header: Title + Price + Actions + Highlights */}
        <ListingHeader
          id={listing.id}
          year={listing.year}
          make={listing.make}
          model={listing.model}
          trim={listing.trim}
          price={listing.price}
          isNegotiable={listing.isNegotiable}
          isBlk={isBlk}
          isFavorite={isFavorite}
          specialNotes={listing.specialNotes}
          tags={listing.tags}
          onFavoritePress={onFavoritePress}
        />

        {/* Quick Stats: Mileage, Specs, Location, VIN */}
        <QuickStats
          mileage={listing.mileage}
          specs={listing.specs}
          emirate={listing.emirate}
          city={listing.city}
          vin={listing.vin}
          isBlk={isBlk}
        />

        {/* Description */}
        {listing.description && (
          <ListingDescription
            description={listing.description}
            isBlk={isBlk}
          />
        )}

        {/* Specifications */}
        <ListingSpecs
          condition={listing.condition}
          bodyType={listing.bodyType}
          transmission={listing.transmission}
          fuelType={listing.fuelType}
          engineSize={listing.engineSize}
          cylinders={listing.cylinders}
          powerRange={listing.powerRange}
          exteriorColor={listing.exteriorColor}
          interiorColor={listing.interiorColor}
          doors={listing.doors}
          seatingCapacity={listing.seatingCapacity}
          steeringSide={listing.steeringSide}
          isBlk={isBlk}
        />

        {/* Features */}
        <ListingFeatures extras={listing.extras} isBlk={isBlk} />

        {/* Timestamp - subtle, non-blocking */}
        <ListingTimestamp
          createdAt={listing.createdAt}
          lastEditedAt={listing.lastEditedAt}
          publishedAt={listing.approvedAt}
          isBlk={isBlk}
        />

        {/* Seller Card - Tappable to open seller screen */}
        <Pressable onPress={handleTalkToSeller}>
          <SellerCard sellerData={sellerData} isBlk={isBlk} />
        </Pressable>

        {/* Talk to Seller CTA */}
        <Pressable
          style={[
            styles.ctaButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={handleTalkToSeller}
        >
          <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.ctaText}>Talk to Seller</Text>
        </Pressable>
      </View>
    </View>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardDetailedMSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageGallerySkeleton />
      
      <View style={styles.content}>
        {/* Title Skeleton */}
        <Skeleton width="70%" height={24} />
        <Skeleton width={140} height={26} style={{ marginTop: 4 }} />
        
        {/* Stats Skeleton */}
        <View style={styles.skeletonStats}>
          <Skeleton width={60} height={16} />
          <Skeleton width={70} height={16} />
          <Skeleton width={80} height={16} />
        </View>

        {/* Section Skeleton */}
        <Skeleton width={120} height={12} style={{ marginTop: Spacing.lg }} />
        <Skeleton width="100%" height={80} style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing['xl'],
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
