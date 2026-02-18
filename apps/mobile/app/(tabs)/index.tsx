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
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopSafeAreaGradient } from '@/components/layout';

import {
  HomeHeader,
  BlkGridCard,
  RevvupFirstGrid,
  CategoryCard,
  PartnerShowcaseCard,
  PartnerShowcaseCardSkeleton,
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

// ============================================================================
// GRID ITEM RENDERER
// ============================================================================

interface GridItemProps {
  gridState: GridState;
  partners: PartnerListItem[];
}

const GridItem = React.memo(function GridItem({ gridState, partners }: GridItemProps) {
  const { config, data, isLoading } = gridState;

  // Render based on grid type
  switch (config.type) {
    case 'blk':
      return (
        <BlkGridCard
          listings={data?.listings?.map(l => ({
            id: l.id,
            make: l.make,
            model: l.model,
            year: l.year,
            trim: l.trim,
            price: l.price,
            mileage: l.mileage,
            thumbnail: l.thumbnail,
            isBlkListing: l.isBlkListing,
          })) || []}
          isLoading={isLoading}
        />
      );

    case 'founding':
      // Use partners list sorted by join date
      const foundingPartners = partners
        .slice(0, 10)
        .map(partnerToFoundingItem);
      return (
        <RevvupFirstGrid
          partners={foundingPartners}
          isLoading={isLoading && partners.length === 0}
        />
      );

    case 'category':
    case 'make':
    case 'price_range':
    case 'newest':
    case 'popular':
    case 'hidden_gems':
      // All these render as category cards with listings
      return (
        <CategoryCard
          id={config.id}
          name={config.title}
          subtitle={config.subtitle}
          listings={data?.listings?.map(l => ({
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
          })) || []}
          isLoading={isLoading}
        />
      );

    case 'partner':
      // Partner showcase with their listings
      // Show loading state while fetching, then render partner data
      if (isLoading && !data?.partner) {
        // Show skeleton placeholder
        return (
          <View style={styles.partnerContainer}>
            <PartnerShowcaseCardSkeleton />
          </View>
        );
      }
      
      if (data?.partner) {
        const displayData = partnerToDisplayData(
          data.partner, 
          data.listings || []
        );
        return (
          <View style={styles.partnerContainer}>
            <PartnerShowcaseCard
              partner={displayData}
              isLoading={isLoading}
            />
          </View>
        );
      }
      
      // Partner not found - don't render anything
      return null;

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

  // Footer loading skeleton
  const renderFooter = useCallback(() => {
    if (!isLoading) return <View style={styles.bottomSpacer} />;
    return (
      <View style={styles.loadingFooter}>
        <View style={[styles.skeletonCard, { backgroundColor: colors.oledBlack, borderColor: colors.glassBorderOnDark }]}>
          <View style={styles.skeletonHeader}>
            <Skeleton width="50%" height={20} style={{ backgroundColor: '#1A1A1A' }} />
            <Skeleton width="70%" height={14} style={{ marginTop: Spacing.xs, backgroundColor: '#1A1A1A' }} />
          </View>
          <View style={styles.skeletonContent}>
            <Skeleton width={120} height={90} borderRadius={Radius.lg} style={{ backgroundColor: '#1A1A1A' }} />
            <Skeleton width={120} height={90} borderRadius={Radius.lg} style={{ backgroundColor: '#1A1A1A' }} />
          </View>
        </View>
      </View>
    );
  }, [isLoading, colors.oledBlack, colors.glassBorderOnDark]);

  // Header component (empty, actual header is absolute positioned)
  const renderHeader = useCallback(() => null, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopSafeAreaGradient />
      <HomeHeader />
      
      <FlatList
        data={loadedGrids}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
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
            tintColor={colors.textPrimary}
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
  partnerContainer: {
    paddingHorizontal: Spacing.sm,
  },
  loadingFooter: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  skeletonCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    paddingBottom: Spacing['2xl'],
  },
  skeletonHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  skeletonContent: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  bottomSpacer: {
    height: Layout.tabBarHeight + Spacing['3xl'],
  },
});
