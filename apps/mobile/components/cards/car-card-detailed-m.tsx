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

import { Text, HapticPressable, Skeleton, BlkBadge } from '@/components/ui';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager, StyleSheet, View, Platform, Clipboard } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronRight, MessageCircle, Copy, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { DescriptionSheet, FeaturesSheet, FinancingSheet, SpecsSheet } from '@/components/sheets';
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
  ListingHighlights,
  ListingQuickNotes,
  ListingDescription,
  ListingSpecs,
  ListingFeatures,
  SellerCard,
  ListingTimestamp,
} from '@/components/listings';
import { FinancingCalculator } from '@/components/listings';
import { formatPrice, formatMileage, formatSpecs, formatEmirate } from '@/components/listings/types';

// ============================================================================
// PROPS
// ============================================================================

export interface CarCardDetailedMProps {
  listing: ListingDetailedData;
  sellerData: SellerData;
  listingId: string;
}

// ============================================================================
// TALK TO SELLER ROW
// ============================================================================

function TalkToSellerRow({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const bgOpacity = useSharedValue(0);

  const animatedBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(bgOpacity.value, [0, 1], ['transparent', colors.fill]),
  }));

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      <View style={[styles.ctaCard, { backgroundColor: colors.surface }]}>
        <View style={styles.ctaHeader}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Contact</Text>
        </View>
        <View style={[styles.ctaDivider, { backgroundColor: colors.border }]} />
        <HapticPressable
          onPress={onPress}
          onPressIn={() => { bgOpacity.value = withTiming(1, { duration: 100 }); }}
          onPressOut={() => { bgOpacity.value = withTiming(0, { duration: 200 }); }}
        >
          <Animated.View style={[styles.ctaRow, animatedBgStyle]}>
            <View style={styles.ctaLeft}>
              <MessageCircle size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
              <Text variant="subhead">Talk to Seller</Text>
            </View>
            <ChevronRight size={Sizes.iconSm} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
          </Animated.View>
        </HapticPressable>
      </View>
    </Animated.View>
  );
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

  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(48);
  const [interestRate] = useState(3.5);
  const [financingSheetVisible, setFinancingSheetVisible] = useState(false);

  const handleCustomizeFinancing = useCallback(() => {
    setFinancingSheetVisible(true);
  }, []);

  const handleApplyCustomFinancing = useCallback((dp: number, term: number) => {
    setDownPaymentPercent(dp);
    setLoanTermMonths(term);
  }, []);

  // Navigate to the dedicated seller contact screen
  const handleTalkToSeller = useCallback(() => {
    router.push(`/seller-contact/${listingId}`);
  }, [router, listingId]);

  // VIN copy state
  const [vinCopied, setVinCopied] = useState(false);
  const handleCopyVin = useCallback(async () => {
    if (!listing.vin) return;
    try {
      Clipboard.setString(listing.vin);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setVinCopied(true);
      setTimeout(() => setVinCopied(false), 2000);
    } catch {}
  }, [listing.vin]);

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

      {/* ── Content ── */}
      <View style={styles.content}>

        {/* ── Identity block ── */}
        <View style={styles.identityBlock}>
          {/* 1. Car name */}
          <View style={styles.titleRow}>
            <Text variant="bodyEmphasized" style={{ flex: 1 }} numberOfLines={2}>
              {carTitle}
            </Text>
            {isBlk && (
              <BlkBadge size="sm" />
            )}
          </View>

          {/* 2. Meta: mileage · specs · emirate */}
          <Text variant="subhead" tone="secondary">
            {formatMileage(listing.mileage)} km · {formatSpecs(listing.specs)} · {listing.city ? `${listing.city}, ${formatEmirate(listing.emirate)}` : formatEmirate(listing.emirate)}
          </Text>

          {/* 3. Price */}
          <View style={styles.priceRow}>
            <Text variant="title2Emphasized" tone="primary">{formatPrice(listing.price)}</Text>
            {listing.isNegotiable && (
              <Text variant="subhead" tone="success">Negotiable</Text>
            )}
          </View>

          {/* 4. VIN */}
          {listing.vin && listing.vinVisibility !== 'private' && (
            <HapticPressable onPress={handleCopyVin}>
              <View style={styles.vinRow}>
                <Text variant="caption1Emphasized" tone="muted">VIN</Text>
                <Text variant="caption1" tone="muted" style={styles.vinValue}>{listing.vin}</Text>
                {vinCopied
                  ? <Check size={Sizes.iconXs} color={colors.success} strokeWidth={Stroke.icon} />
                  : <Copy size={Sizes.iconXs} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
                }
              </View>
            </HapticPressable>
          )}
          {listing.vinVisibility === 'private' && (
            <View style={styles.vinRow}>
              <Text variant="caption1Emphasized" tone="muted">VIN</Text>
              <Text variant="caption1" style={{ color: colors.success }}>Verified</Text>
            </View>
          )}
        </View>

        {/* ── Seller + Contact ── */}
        {sellerData && (
          <View style={styles.sellerBlock}>
            <HapticPressable onPress={handleTalkToSeller}>
              <SellerCard sellerData={sellerData} />
            </HapticPressable>
            <TalkToSellerRow onPress={handleTalkToSeller} />
          </View>
        )}

        {showDeferredSections ? (
          <>
            {/* 3. Highlights */}
            <ListingHighlights
              specialNotes={listing.specialNotes}
              tags={listing.tags}
            />

            {/* 5. Specifications */}
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

            {/* 4. Description */}
            {listing.description && (
              <ListingDescription
                description={listing.description}
                onReadMore={openDescSheet}
              />
            )}

            {/* 5. Features */}
            <ListingFeatures extras={listing.extras} onViewAll={openFeaturesSheet} />

            {/* 6. Seller Notes */}
            <ListingQuickNotes specialNotes={listing.specialNotes} />

            <FinancingCalculator
              price={listing.price}
              downPaymentPercent={downPaymentPercent}
              loanTermMonths={loanTermMonths}
              interestRate={interestRate}
              onDownPaymentChange={setDownPaymentPercent}
              onTermChange={setLoanTermMonths}
              onCustomize={handleCustomizeFinancing}
              colors={colors}
            />

            {/* 6. Timestamp */}
            <ListingTimestamp
              createdAt={listing.createdAt}
              lastEditedAt={listing.lastEditedAt}
              publishedAt={listing.publishedAt}
              originalPublishedAt={listing.originalPublishedAt}
            />
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

      <FinancingSheet
        visible={financingSheetVisible}
        onClose={() => setFinancingSheetVisible(false)}
        initialDownPayment={downPaymentPercent}
        initialTerm={loanTermMonths}
        price={listing.price}
        interestRate={interestRate}
        onApply={handleApplyCustomFinancing}
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
  sellerBlock: {
    gap: Spacing['2xl'],
  },
  identityBlock: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vinValue: {
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  ctaCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  ctaHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ctaDivider: {
    height: StyleSheet.hairlineWidth,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
