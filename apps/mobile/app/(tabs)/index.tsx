/**
 * Home Tab Screen
 * 
 * Dynamic feed with lazy-loaded grids:
 * - BLK Signature Collection
 * - Founding Partners
 * - Category grids (body type, make groups, price ranges)
 * - Partner showcases
 * 
 * Grids load in batches of 4 as user scrolls for performance.
 */

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopSafeAreaGradient } from '@/components/layout';

import {
  HomeHeader,
  GreetingNote,
  BlkGridCard,
  RevvupFirstGrid,
  CategoryCard,
  PartnerShowcaseCard,
} from '@/components/home';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Layout, Sizes, Radius } from '@/constants/theme';
import { Skeleton } from '@/components/ui';
import { useHomeGrids, type GridState } from '@/hooks/use-home-grids';
import { partnerToFoundingItem } from '@/components/home/revvup-first-grid';
import { partnerToDisplayData } from '@/components/home/partner-grid';
import { type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// CONSTANTS
// ============================================================================

const HEADER_HEIGHT = Layout.headerPadding + Sizes.bubble + Spacing.md;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const TOP_SPACING = SCREEN_HEIGHT * 0.2; // 20% of screen height

// ============================================================================
// HOME SCREEN SKELETON (Initial Loading State)
// ============================================================================

const HomeScreenSkeleton = React.memo(function HomeScreenSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <Skeleton width="100%" height={220} borderRadius={Radius['2xl']} />
      <Skeleton width="100%" height={180} borderRadius={Radius['2xl']} />
      <Skeleton width="100%" height={220} borderRadius={Radius['2xl']} />
    </View>
  );
});

// ============================================================================
// GRID ITEM RENDERER
// ============================================================================

interface GridItemProps {
  gridState: GridState;
  partners: PartnerListItem[];
}

const GridItem = React.memo(function GridItem({ gridState, partners }: GridItemProps) {
  const { config, data, isLoading } = gridState;

  // Don't render anything while loading - parent shows skeleton
  if (isLoading && !data) return null;

  // Render based on grid type
  switch (config.type) {
    case 'blk':
      if (!data?.listings?.length) return null;
      return (
        <BlkGridCard
          listings={data.listings.map(l => ({
            id: l.id,
            make: l.make,
            model: l.model,
            year: l.year,
            trim: l.trim,
            price: l.price,
            mileage: l.mileage,
            thumbnail: l.thumbnail,
            isBlkListing: l.isBlkListing,
          }))}
        />
      );

    case 'founding':
      // Use partners list sorted by join date
      if (partners.length === 0) return null;
      const foundingPartners = partners
        .slice(0, 10)
        .map(partnerToFoundingItem);
      return (
        <RevvupFirstGrid
          partners={foundingPartners}
        />
      );

    case 'category':
    case 'make':
    case 'price_range':
    case 'newest':
    case 'popular':
    case 'hidden_gems':
      // All these render as category cards with listings
      if (!data?.listings?.length) return null;
      return (
        <CategoryCard
          id={config.id}
          name={config.title}
          subtitle={config.subtitle}
          searchParams={config.searchParams}
          listings={data.listings.map(l => ({
            id: l.id,
            make: l.make,
            model: l.model,
            year: l.year,
            trim: l.trim,
            price: l.price,
            mileage: l.mileage,
            emirate: l.emirate,
            specs: l.specs,
            thumbnail: l.thumbnail,
            isBlkListing: l.isBlkListing,
          }))}
        />
      );

    case 'showroom':
      // Temporarily disabled - showroom grids dropped from home tab
      return null;

    case 'partner':
      // Partner showcase with their listings - only render when data is available
      if (!data?.partner) return null;
      
      const displayData = partnerToDisplayData(
        data.partner, 
        data.listings || []
      );
      return (
        <PartnerShowcaseCard
          partner={displayData}
        />
      );

    default:
      return null;
  }
});

// ============================================================================
// HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  
  // Load grids with lazy loading
  const { 
    loadedGrids, 
    hasMore, 
    isLoading, 
    loadMore, 
    refresh,
    partners,
  } = useHomeGrids();

  // Dynamic top padding based on safe area + header
  const contentTopPadding = insets.top + HEADER_HEIGHT;

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Render grid item
  const renderItem = useCallback(({ item }: { item: GridState }) => (
    <GridItem gridState={item} partners={partners} />
  ), [partners]);

  // Key extractor
  const keyExtractor = useCallback((item: GridState) => item.config.id, []);

  // Load more trigger
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Footer - just bottom spacer
  const renderFooter = useCallback(() => (
    <View style={styles.bottomSpacer} />
  ), []);

  // Header component with greeting
  const renderHeader = useCallback(() => (
    <View>
      <View style={{ height: TOP_SPACING }} />
      <View style={styles.greetingContainer}>
        <GreetingNote />
      </View>
    </View>
  ), []);

  // Empty state skeleton (initial loading)
  const renderEmpty = useCallback(() => {
    if (isLoading || loadedGrids.length === 0) {
      return <HomeScreenSkeleton />;
    }
    return null;
  }, [isLoading, loadedGrids.length]);

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? colors.oledWhite : colors.oledBlack }]}>
      <TopSafeAreaGradient useOled />
      <HomeHeader />
      
      <FlatList
        data={loadedGrids}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingTop: contentTopPadding }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text}
            progressViewOffset={contentTopPadding}
          />
        }
      />
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
  listContent: {
    gap: Spacing.lg,
  },
  greetingContainer: {
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Layout.tabBarHeight + Spacing['3xl'],
  },
  skeletonContainer: {
    gap: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
  },
});
