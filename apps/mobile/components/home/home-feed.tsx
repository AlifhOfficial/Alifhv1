/**
 * HomeFeed
 *
 * Four sections below QuickActions on the home tab:
 *  1. Browse by Make  — horizontal pill row (navigates to browse with make filter)
 *  2. BLK             — premium BLK listings with dark header
 *  3. New Arrivals    — recently listed (sortBy: newest)
 *  4. Hidden Gems     — low mileage, competitive price
 *
 * All styling uses the Revvup design system tokens.
 * Follows Apple Human Interface Guidelines.
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text, HapticPressable } from '@/components/ui';
import { CarCardM, CarCardMSkeleton } from '@/components/cards';
import { Layout, Radius, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { useHomeFeed } from '@/hooks/use-home-feed';
import type { ListingCard, SearchSortOption } from '@/lib/search-api';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH_RATIO = 0.84;
const MAX_CARD_WIDTH = 380;

const SKELETON_COUNT = 3;

// ============================================================================
// SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onSeeAll?: () => void;
}

const SectionHeader = memo(function SectionHeader({ title, subtitle, eyebrow, onSeeAll }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {eyebrow ? (
          <Text variant="caption1Emphasized" tone="secondary" uppercase>{eyebrow}</Text>
        ) : null}
        <Text variant="headline">{title}</Text>
        {subtitle ? (
          <Text variant="subhead" tone="secondary">{subtitle}</Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <HapticPressable
          onPress={onSeeAll}
          hitSlop={Layout.hitSlop}
          style={styles.seeAllButton}
        >
          <Text variant="subheadEmphasized" style={{ color: colors.primary }}>See all</Text>
        </HapticPressable>
      ) : null}
    </View>
  );
});

// ============================================================================
// BLK SECTION HEADER — premium dark band
// ============================================================================

interface BlkSectionHeaderProps {
  onSeeAll: () => void;
}

const BlkSectionHeader = memo(function BlkSectionHeader({ onSeeAll }: BlkSectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text variant="headline">Black Cars</Text>
        <Text variant="subhead" tone="secondary">Premium collection from the marketplace</Text>
      </View>
      <HapticPressable
        onPress={onSeeAll}
        hitSlop={Layout.hitSlop}
        style={styles.seeAllButton}
      >
        <Text variant="subheadEmphasized" style={{ color: colors.primary }}>See all</Text>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// CARD ITEM — fixed-width wrapper for horizontal scroll
// ============================================================================

interface CardItemProps {
  item: ListingCard;
  cardWidth: number;
}

const CardItem = memo(function CardItem({ item, cardWidth }: CardItemProps) {
  const router = useRouter();

  const handlePress = useCallback((id: string) => {
    router.push(`/listing/${id}` as any);
  }, [router]);

  return (
    <View style={[styles.cardWrapper, { width: cardWidth }]}>
      <CarCardM
        id={item.id}
        make={item.make}
        model={item.model}
        year={item.year}
        trim={item.trim}
        price={item.price}
        mileage={item.mileage}
        emirate={item.emirate}
        specs={item.specs}
        thumbnail={item.thumbnail}
        isBlkListing={item.isBlkListing}
        partnerName={item.partnerName}
        partnerLogo={item.partnerLogo}
        partnerVerified={item.partnerVerified}
        isBlackTierPartner={item.isBlackTierPartner}
        sellerName={item.sellerName}
        sellerAvatarUrl={item.sellerAvatarUrl}
        kycVerified={item.sellerKycVerified}
        onPress={handlePress}
      />
    </View>
  );
});

// ============================================================================
// CARD SKELETON ROW — matches FlatList padding/gap exactly
// ============================================================================

function CardSkeletonRowSized({ cardWidth }: { cardWidth: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={styles.cardListContent}
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <View key={i} style={[styles.cardWrapper, { width: cardWidth }]}>
          <CarCardMSkeleton />
        </View>
      ))}
    </ScrollView>
  );
}

// ============================================================================
// CARD SECTION — reusable horizontal listing strip
// ============================================================================

interface CardSectionProps {
  header: React.ReactNode;
  listings: ListingCard[];
  isLoading: boolean;
  cardWidth: number;
  snapInterval: number;
  delay?: number;
}

function CardSection({ header, listings, isLoading, cardWidth, snapInterval, delay = 0 }: CardSectionProps) {
  const renderItem: ListRenderItem<ListingCard> = useCallback(
    ({ item }) => <CardItem item={item} cardWidth={cardWidth} />,
    [cardWidth],
  );
  const keyExtractor = useCallback((item: ListingCard) => item.id, []);

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(320)}>
      <View style={styles.sectionPadded}>{header}</View>
      {isLoading ? (
        <CardSkeletonRowSized cardWidth={cardWidth} />
      ) : listings.length > 0 ? (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardListContent}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          snapToAlignment="start"
          removeClippedSubviews
        />
      ) : null}
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HomeFeed = memo(function HomeFeed() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { applySearch, applySort, clearFilterParams, resetSort, updateFilterParams } = useSearch();
  const router = useRouter();
  const {
    blk,
    justListed,
    hiddenGems,
    isLoadingBlk,
    isLoadingJustListed,
    isLoadingHiddenGems,
  } = useHomeFeed();
  const cardWidth = Math.min(MAX_CARD_WIDTH, width * CARD_WIDTH_RATIO);
  const snapInterval = cardWidth + Spacing.md;

  const goToBrowse = useCallback(() => {
    router.push('/(tabs)/(browse)' as any);
  }, [router]);

  const openBrowseWithState = useCallback((options: {
    search?: Parameters<typeof applySearch>[0];
    filters?: Parameters<typeof updateFilterParams>[0];
    sortBy?: SearchSortOption;
  }) => {
    applySearch(options.search ?? {});
    clearFilterParams();

    if (options.filters) {
      updateFilterParams(options.filters);
    }

    if (options.sortBy) {
      applySort(options.sortBy);
    } else {
      resetSort();
    }

    goToBrowse();
  }, [applySearch, applySort, clearFilterParams, goToBrowse, resetSort, updateFilterParams]);

  const handleSeeAllBlk = useCallback(() => {
    openBrowseWithState({ filters: { isBlkListing: true }, sortBy: 'popular' });
  }, [openBrowseWithState]);

  const handleSeeAllNewArrivals = useCallback(() => {
    openBrowseWithState({ sortBy: 'newest' });
  }, [openBrowseWithState]);

  const handleSeeAllHiddenGems = useCallback(() => {
    openBrowseWithState({ filters: { mileageMax: 60000 }, sortBy: 'price_low' });
  }, [openBrowseWithState]);

  return (
    <View style={styles.root}>

      {/* ── Section 1: BLK Premium ──────────────────────────────────────── */}
      <CardSection
        header={<BlkSectionHeader onSeeAll={handleSeeAllBlk} />}
        listings={blk}
        isLoading={isLoadingBlk}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        delay={0}
      />

      <View style={[styles.separator, { backgroundColor: colors.separator }]} />

      {/* ── Section 2: New Arrivals ─────────────────────────────────────── */}
      <CardSection
        header={
          <SectionHeader
            title="New Arrivals"
            subtitle="Just listed, first to browse"
            onSeeAll={handleSeeAllNewArrivals}
          />
        }
        listings={justListed}
        isLoading={isLoadingJustListed}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        delay={120}
      />

      <View style={[styles.separator, { backgroundColor: colors.separator }]} />

      {/* ── Section 3: Hidden Gems ──────────────────────────────────────── */}
      <CardSection
        header={
          <SectionHeader
            title="Hidden Gems"
            subtitle="Low mileage · competitive price"
            onSeeAll={handleSeeAllHiddenGems}
          />
        }
        listings={hiddenGems}
        isLoading={isLoadingHiddenGems}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        delay={180}
      />

    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  root: {
    gap: Spacing.xl,
  },

  // ── Section layout ────────────────────────────────────────────────────────
  sectionPadded: {
    paddingHorizontal: Layout.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    gap: Spacing.xs,
    flex: 1,
  },
  seeAllButton: {
    minHeight: Sizes.pillHeight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Separator ─────────────────────────────────────────────────────────────
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Layout.screenPadding,
  },

  // ── Make pills ────────────────────────────────────────────────────────────
  // ── Card list ─────────────────────────────────────────────────────────────
  cardListContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingRight: Layout.screenPadding + Spacing.md,
    gap: Spacing.md,
  },
  cardWrapper: {
    minWidth: 0,
  },
});
