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
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton } from '@/components/ui';
import { DescriptionSheet, SpecsSheet } from '@/components/sheets';
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
// SECTION DIVIDER (reusable thin rule between content blocks)
// ============================================================================

function SectionDivider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
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
  const dividerColor = isBlk ? colors.blkBorder : colors.border;

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;

  // Description sheet state
  const [descSheetVisible, setDescSheetVisible] = useState(false);
  const openDescSheet = useCallback(() => setDescSheetVisible(true), []);
  const closeDescSheet = useCallback(() => setDescSheetVisible(false), []);

  // Specs sheet state
  const [specsSheetVisible, setSpecsSheetVisible] = useState(false);
  const openSpecsSheet = useCallback(() => setSpecsSheetVisible(true), []);
  const closeSpecsSheet = useCallback(() => setSpecsSheetVisible(false), []);

  // Navigate to the dedicated seller contact screen
  const handleTalkToSeller = useCallback(() => {
    router.push(`/seller-contact/${listingId}`);
  }, [router, listingId]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ── Image Gallery — 40 % of viewport ── */}
      <ImageGallery images={listing.images} title={carTitle} />

      {/* ── Content — padded with generous vertical rhythm ── */}
      <View style={styles.content}>

        {/* 1. Header: Title + Price + Actions + Highlights */}
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

        {/* 2. Quick Stats: Mileage · Specs · Location · VIN */}
        <QuickStats
          mileage={listing.mileage}
          specs={listing.specs}
          emirate={listing.emirate}
          city={listing.city}
          vin={listing.vin}
          isBlk={isBlk}
        />

        <SectionDivider color={dividerColor} />

        {/* 3. Description (optional) */}
        {listing.description && (
          <>
            <ListingDescription
              description={listing.description}
              isBlk={isBlk}
              onReadMore={openDescSheet}
            />
            <SectionDivider color={dividerColor} />
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
          isBlk={isBlk}
          onViewAll={openSpecsSheet}
        />

        <SectionDivider color={dividerColor} />

        {/* 5. Features / Extras */}
        <ListingFeatures extras={listing.extras} isBlk={isBlk} />

        <SectionDivider color={dividerColor} />

        {/* 6. Timestamp — subtle, non-blocking */}
        <ListingTimestamp
          createdAt={listing.createdAt}
          lastEditedAt={listing.lastEditedAt}
          publishedAt={listing.approvedAt}
          isBlk={isBlk}
        />

        <SectionDivider color={dividerColor} />

        {/* 7. Seller Card — tappable to open seller screen */}
        <Pressable onPress={handleTalkToSeller}>
          <SellerCard sellerData={sellerData} isBlk={isBlk} />
        </Pressable>

        {/* 8. Talk to Seller CTA — inverse in dark mode */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colorScheme === 'dark' ? colors.text : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleTalkToSeller}
        >
          <MessageCircle
            size={20}
            color={colorScheme === 'dark' ? colors.primary : colors.primaryForeground}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.ctaText,
              { color: colorScheme === 'dark' ? colors.primary : colors.primaryForeground },
            ]}
          >
            Talk to Seller
          </Text>
        </Pressable>
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
// STYLES — all text styles reference Typography tokens
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

  /* Section divider */
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },

  /* CTA button */
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    // Lift the button off the surface
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    ...Typography.titleSmall, // 17px / SemiBold — larger for primary CTA
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
