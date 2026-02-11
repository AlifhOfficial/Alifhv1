/**
 * Car Card Detailed Mobile (CarCardDetailedM) - Revvup Design System
 *
 * Full listing detail view — composes modular components.
 * Clean, gesture-based gallery with 40 % viewport height.
 *
 * Visual hierarchy:
 *   Gallery → Header → Stats → Description → Specs → Features
 *   → Timestamp → Seller → CTA
 *
 * Every text style references a Typography token — zero hardcoded
 * font sizes / families.  Sections breathe with generous spacing
 * and a thin divider keeps the rhythm.
 */

import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, Data } from '@/components/ui';
import { DescriptionSheet, FeaturesSheet, SpecsSheet } from '@/components/sheets';
import { ListingDetailedData, SellerData } from '@/lib/listing-api';

import {
  ImageGallery,
  ImageGallerySkeleton,
  ListingHeader,
  ListingHighlights,
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
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CarCardDetailedM = memo(function CarCardDetailedM({
  listing,
  sellerData,
  listingId,
}: CarCardDetailedMProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const isBlk = listing.isBlkListing;
  // Use standard theme colors for all listings (BLK branding shown via badges only)
  const bgColor = colors.background;

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Description sheet state
  const [descSheetVisible, setDescSheetVisible] = useState(false);
  const openDescSheet = useCallback(() => setDescSheetVisible(true), []);
  const closeDescSheet = useCallback(() => setDescSheetVisible(false), []);

  // Specs sheet state
  const [specsSheetVisible, setSpecsSheetVisible] = useState(false);
  const openSpecsSheet = useCallback(() => setSpecsSheetVisible(true), []);
  const closeSpecsSheet = useCallback(() => setSpecsSheetVisible(false), []);

  // Features sheet state
  const [featuresSheetVisible, setFeaturesSheetVisible] = useState(false);
  const openFeaturesSheet = useCallback(() => setFeaturesSheetVisible(true), []);
  const closeFeaturesSheet = useCallback(() => setFeaturesSheetVisible(false), []);

  // Navigate to the dedicated seller contact screen
  const handleTalkToSeller = useCallback(() => {
    router.push(`/seller-contact/${listingId}`);
  }, [router, listingId]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ── Image Gallery — 40 % of viewport ── */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* ── Highlights — positioned right below gallery for prominence ── */}
      <ListingHighlights
        specialNotes={listing.specialNotes}
        tags={listing.tags}
      />

      {/* ── Content — padded with generous vertical rhythm ── */}
      <View style={styles.content}>

        {/* 1. Header: Title + Price + Actions */}
        <ListingHeader
          id={listing.id}
          year={listing.year}
          make={listing.make}
          model={listing.model}
          trim={listing.trim}
          price={listing.price}
          isNegotiable={listing.isNegotiable}
          isBlk={isBlk}
        />

        {/* 2. Quick Stats: Mileage · Specs · Location · VIN */}
        <QuickStats
          mileage={listing.mileage}
          specs={listing.specs}
          emirate={listing.emirate}
          city={listing.city}
          vin={listing.vin}
        />

        {/* 3. Description (optional) */}
        {listing.description && (
          <>
            <ListingDescription
              description={listing.description}
              onReadMore={openDescSheet}
            />
          </>
        )}

        {/* 4. Specifications */}
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
          onViewAll={openSpecsSheet}
        />

        {/* 5. Features / Extras */}
        <ListingFeatures extras={listing.extras} onViewAll={openFeaturesSheet} />

        {/* 6. Timestamp — subtle, non-blocking */}
        <ListingTimestamp
          createdAt={listing.createdAt}
          lastEditedAt={listing.lastEditedAt}
          publishedAt={listing.approvedAt}
        />

        {/* 7. Seller Section — merged profile + contact action */}
        {sellerData && (
          <HapticPressable 
            onPress={handleTalkToSeller}
          >
            <SellerCard 
              sellerData={sellerData}
              action={
                <View style={styles.contactAction}>
                  <Data size="medium" tone="primary">
                    Contact
                  </Data>
                  <ChevronRight size={ICON_SIZE_SM} color={colors.primary} strokeWidth={2} />
                </View>
              }
            />
          </HapticPressable>
        )}
      </View>

      {/* Description Sheet — rendered at root level for proper gesture handling */}
      {listing.description && (
        <DescriptionSheet
          visible={descSheetVisible}
          onClose={closeDescSheet}
          description={listing.description}
        />
      )}

      {/* Specs Sheet — rendered at root level for proper gesture handling */}
      <SpecsSheet
        visible={specsSheetVisible}
        onClose={closeSpecsSheet}
        specs={[
          { label: 'Condition', value: listing.condition },
          { label: 'Body Type', value: listing.bodyType },
          { label: 'Transmission', value: listing.transmission },
          { label: 'Fuel Type', value: listing.fuelType },
          { label: 'Engine', value: listing.engineSize },
          { label: 'Cylinders', value: listing.cylinders },
          { label: 'Power', value: listing.powerRange },
          { label: 'Exterior Color', value: listing.exteriorColor },
          { label: 'Interior Color', value: listing.interiorColor },
          { label: 'Doors', value: listing.doors },
          { label: 'Seats', value: listing.seatingCapacity },
          { label: 'Steering', value: listing.steeringSide },
        ].filter(s => s.value != null)}
      />

      {/* Features Sheet — rendered at root level for proper gesture handling */}
      {listing.extras.length > 0 && (
        <FeaturesSheet
          visible={featuresSheetVisible}
          onClose={closeFeaturesSheet}
          features={listing.extras}
        />
      )}
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
        {/* Title block */}
        <View style={styles.skeletonTitleBlock}>
          <Skeleton width="70%" height={24} />
          <Skeleton width={140} height={22} />
        </View>

        {/* Stats row */}
        <View style={styles.skeletonStats}>
          <Skeleton width={60} height={16} />
          <Skeleton width={70} height={16} />
          <Skeleton width={80} height={16} />
        </View>

        {/* Divider placeholder */}
        <Skeleton width="100%" height={1} />

        {/* Description block */}
        <View style={styles.skeletonDescBlock}>
          <Skeleton width={100} height={14} />
          <Skeleton width="100%" height={60} />
        </View>

        {/* Specs block */}
        <View style={styles.skeletonDescBlock}>
          <Skeleton width={120} height={14} />
          <Skeleton width="100%" height={80} />
        </View>

        {/* CTA */}
        <Skeleton width="100%" height={48} borderRadius={Radius.lg} />
      </View>
    </View>
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZE_SM = 18;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  /* Layout */
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    gap: Spacing['2xl'],
  },

  /* Contact action */
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2, // 2
  },

  /* Skeleton helpers */
  skeletonTitleBlock: {
    gap: Spacing.xs,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skeletonDescBlock: {
    gap: Spacing.sm,
  },
});
