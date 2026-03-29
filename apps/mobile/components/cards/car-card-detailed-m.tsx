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

import { Text, HapticPressable, Skeleton } from '@/components/ui';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { DescriptionSheet, FeaturesSheet, SpecsSheet } from '@/components/sheets';
import { ListingDetailedData, SellerData } from '@/lib/listing-api';
import {
  getEnumLabel,
  VEHICLE_CONDITIONS,
  BODY_TYPES,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  STEERING_SIDES,
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  POWER_RANGES,
  ENGINE_SIZES,
} from '@/lib/listing-constants';

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
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  // Navigate to the dedicated seller contact screen
  const handleTalkToSeller = useCallback(() => {
    router.push(`/seller-contact/${listingId}`);
  }, [router, listingId]);

  useEffect(() => {
    setShowDeferredSections(false);

    const interaction = InteractionManager.runAfterInteractions(() => {
      setShowDeferredSections(true);
    });

    return () => {
      interaction.cancel();
    };
  }, [listing.id]);

  const specsSheetItems = useMemo(
    () => [
      { label: 'Condition', value: listing.condition ? getEnumLabel(VEHICLE_CONDITIONS, listing.condition) : null },
      { label: 'Body Type', value: listing.bodyType ? getEnumLabel(BODY_TYPES, listing.bodyType) : null },
      { label: 'Transmission', value: listing.transmission ? getEnumLabel(TRANSMISSION_TYPES, listing.transmission) : null },
      { label: 'Fuel Type', value: listing.fuelType ? getEnumLabel(FUEL_TYPES, listing.fuelType) : null },
      { label: 'Engine', value: listing.engineSize ? getEnumLabel(ENGINE_SIZES, listing.engineSize) : null },
      { label: 'Cylinders', value: listing.cylinders },
      { label: 'Power', value: listing.powerRange ? getEnumLabel(POWER_RANGES, listing.powerRange) : null },
      { label: 'Exterior Color', value: listing.exteriorColor ? getEnumLabel(EXTERIOR_COLORS, listing.exteriorColor) : null },
      { label: 'Interior Color', value: listing.interiorColor ? getEnumLabel(INTERIOR_COLORS, listing.interiorColor) : null },
      { label: 'Doors', value: listing.doors ? getEnumLabel(DOORS_OPTIONS, listing.doors) : null },
      { label: 'Seats', value: listing.seatingCapacity ? getEnumLabel(SEATING_OPTIONS, listing.seatingCapacity) : null },
      { label: 'Steering', value: listing.steeringSide ? getEnumLabel(STEERING_SIDES, listing.steeringSide) : null },
    ].filter(s => s.value != null),
    [
      listing.bodyType,
      listing.condition,
      listing.cylinders,
      listing.doors,
      listing.engineSize,
      listing.exteriorColor,
      listing.fuelType,
      listing.interiorColor,
      listing.powerRange,
      listing.seatingCapacity,
      listing.steeringSide,
      listing.transmission,
    ]
  );

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
          vinVisibility={listing.vinVisibility}
        />

        {showDeferredSections ? (
          <>
            {/* 3. Description (optional) */}
            {listing.description && (
              <ListingDescription
                description={listing.description}
                onReadMore={openDescSheet}
              />
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
              publishedAt={listing.publishedAt}
              originalPublishedAt={listing.originalPublishedAt}
            />

            {/* 7. Seller Section — merged profile + contact action */}
            {sellerData && (
              <HapticPressable onPress={handleTalkToSeller}>
                <SellerCard
                  sellerData={sellerData}
                  action={
                    <View style={styles.contactAction}>
                      <Text variant="body" tone="primary">
                        Contact
                      </Text>
                      <ChevronRight size={Sizes.iconSm} color={colors.primary} strokeWidth={2} />
                    </View>
                  }
                />
              </HapticPressable>
            )}
          </>
        ) : null}
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
        specs={specsSheetItems}
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
          <Skeleton width="70%" height={Spacing['2xl']} />
          <Skeleton width="35%" height={Spacing.xl} />
        </View>

        {/* Stats row */}
        <View style={styles.skeletonStats}>
          <Skeleton width="18%" height={Spacing.lg} />
          <Skeleton width="20%" height={Spacing.lg} />
          <Skeleton width="22%" height={Spacing.lg} />
        </View>

        {/* Divider placeholder */}
        <Skeleton width="100%" height={1} />

        {/* Description block */}
        <View style={styles.skeletonDescBlock}>
          <Skeleton width="25%" height={Spacing.md} />
          <Skeleton width="100%" height={Spacing['5xl'] + Spacing.md} />
        </View>

        {/* Specs block */}
        <View style={styles.skeletonDescBlock}>
          <Skeleton width="30%" height={Spacing.md} />
          <Skeleton width="100%" height={Spacing['5xl'] + Spacing['3xl']} />
        </View>

        {/* CTA */}
        <Skeleton width="100%" height={Spacing['5xl']} borderRadius={Radius.lg} />
      </View>
    </View>
  );
}

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
