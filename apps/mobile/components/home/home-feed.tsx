/**
 * HomeFeed
 *
 * Three curated sections below QuickActions on the home tab.
 * Each section is a surface-backed rounded container:
 *   — centered title
 *   — horizontal card scroll
 *   — "View all" centered at the bottom
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
import { CarFront, Search, Sparkles } from 'lucide-react-native';

import { Text, HapticPressable } from '@/components/ui';
import { CarCardM, CarCardMSkeleton } from '@/components/cards';
import { Layout, Radius, Sizes, Spacing, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { useHomeFeed } from '@/hooks/use-home-feed';
import type { ListingCard, SearchSortOption } from '@/lib/search-api';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH_RATIO = 0.88;
const MAX_CARD_WIDTH = 400;
const SKELETON_COUNT = 3;

// ============================================================================
// CARD ITEM
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
    <View style={{ width: cardWidth }}>
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
// SKELETON ROW
// ============================================================================

function CardSkeletonRow({ cardWidth }: { cardWidth: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={false}
      contentContainerStyle={styles.cardListContent}
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <View key={i} style={{ width: cardWidth }}>
          <CarCardMSkeleton />
        </View>
      ))}
    </ScrollView>
  );
}

// ============================================================================
// FEED SECTION — chrome surface container
// ============================================================================

interface FeedSectionProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  EmptyIcon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  listings: ListingCard[];
  isLoading: boolean;
  cardWidth: number;
  snapInterval: number;
  onViewAll: () => void;
  delay?: number;
}

function FeedSection({
  title,
  description,
  emptyTitle,
  emptyDescription,
  EmptyIcon,
  listings,
  isLoading,
  cardWidth,
  snapInterval,
  onViewAll,
  delay = 0,
}: FeedSectionProps) {
  const { colors } = useTheme();

  const renderItem: ListRenderItem<ListingCard> = useCallback(
    ({ item }) => <CardItem item={item} cardWidth={cardWidth} />,
    [cardWidth],
  );
  const keyExtractor = useCallback((item: ListingCard) => item.id, []);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(360)}
      style={[styles.container, { backgroundColor: colors.grid }]}
    >
      {/* Header: title + description */}
      <View style={styles.header}>
        <Text variant="subheadEmphasized" style={styles.title}>
          {title}
        </Text>
        <Text variant="footnote" tone="secondary" style={styles.description}>
          {description}
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cardsArea}>
        {isLoading ? (
          <CardSkeletonRow cardWidth={cardWidth} />
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
        ) : (
          <View style={[styles.emptyPanel, { backgroundColor: colors.fill3, borderColor: colors.border }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.fill2 }]}>
              <EmptyIcon size={Sizes.iconLg} color={colors.labelTertiary} strokeWidth={Stroke.icon} />
            </View>
            <View style={styles.emptyCopy}>
              <Text variant="subheadEmphasized" style={{ color: colors.label, textAlign: 'center' }}>
                {emptyTitle}
              </Text>
              <Text variant="footnote" style={{ color: colors.labelSecondary, textAlign: 'center' }}>
                {emptyDescription}
              </Text>
            </View>
            <HapticPressable onPress={onViewAll} hitSlop={Layout.hitSlop} style={styles.emptyAction}>
              <Text variant="subheadEmphasized" style={{ color: colors.primary }}>
                Browse cars
              </Text>
            </HapticPressable>
          </View>
        )}
      </View>

      {/* View all — bottom right */}
      {(isLoading || listings.length > 0) ? (
        <HapticPressable onPress={onViewAll} hitSlop={Layout.hitSlop} style={styles.viewAllButton}>
          <Text variant="subheadEmphasized" style={{ color: colors.primary }}>
            View all
          </Text>
        </HapticPressable>
      ) : null}
    </Animated.View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const HomeFeed = memo(function HomeFeed() {
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

  // Cards are sized to the wrapper width (screen minus two gutters)
  const wrapperWidth = width - Layout.screenPadding * 2;
  const cardWidth = Math.min(MAX_CARD_WIDTH, wrapperWidth * CARD_WIDTH_RATIO);
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
    if (options.filters) updateFilterParams(options.filters);
    if (options.sortBy) applySort(options.sortBy);
    else resetSort();
    goToBrowse();
  }, [applySearch, applySort, clearFilterParams, goToBrowse, resetSort, updateFilterParams]);

  const handleViewAllBlk = useCallback(() => {
    openBrowseWithState({ filters: { isBlkListing: true }, sortBy: 'newest' });
  }, [openBrowseWithState]);

  const handleViewAllNewArrivals = useCallback(() => {
    openBrowseWithState({ sortBy: 'newest' });
  }, [openBrowseWithState]);

  const handleViewAllHiddenGems = useCallback(() => {
    openBrowseWithState({ filters: { mileageMax: 60000 }, sortBy: 'price_low' });
  }, [openBrowseWithState]);

  return (
    <View style={styles.root}>

      <FeedSection
        title="BLK Collection"
        description="Premium black cars from verified sellers across the UAE"
        emptyTitle="No BLK cars right now"
        emptyDescription="Fresh premium listings will appear here as soon as they go live."
        EmptyIcon={Sparkles}
        listings={blk}
        isLoading={isLoadingBlk}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        onViewAll={handleViewAllBlk}
        delay={0}
      />

      <FeedSection
        title="New Arrivals"
        description="Just listed — be the first to see what's fresh on the market"
        emptyTitle="No new arrivals yet"
        emptyDescription="Browse the market while we look for the latest listings."
        EmptyIcon={CarFront}
        listings={justListed}
        isLoading={isLoadingJustListed}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        onViewAll={handleViewAllNewArrivals}
        delay={100}
      />

      <FeedSection
        title="Hidden Gems"
        description="Low mileage picks priced well below market — worth a look"
        emptyTitle="No hidden gems found"
        emptyDescription="Try browsing all listings or loosening filters to discover more cars."
        EmptyIcon={Search}
        listings={hiddenGems}
        isLoading={isLoadingHiddenGems}
        cardWidth={cardWidth}
        snapInterval={snapInterval}
        onViewAll={handleViewAllHiddenGems}
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
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
  },

  // ── Section container ─────────────────────────────────────────────────────
  container: {
    borderRadius: Radius['2xl'],
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.xs,
    marginBottom: Spacing['2xl'],
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  cardsArea: {
    marginBottom: Spacing['2xl'],
  },
  cardListContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  emptyPanel: {
    minHeight: 210,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  emptyIconWrap: {
    width: Sizes.bubbleMd,
    height: Sizes.bubbleMd,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    gap: Spacing.xs,
    maxWidth: 280,
  },
  emptyAction: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  // ── View all — bottom right ────────────────────────────────────────────────
  viewAllButton: {
    alignSelf: 'flex-end',
    marginRight: Layout.screenPadding,
  },
});
