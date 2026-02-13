/**
 * Home Widgets Feed — Vertical FlatList
 *
 * Lazy-loads widgets in batches of 4.
 * Pull-to-refresh. Varied-height items (no getItemLayout).
 */

import React, { useCallback, memo } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

import { WidgetCard } from './widget-card';
import { useHomeWidgets } from './use-home-widgets';
import type { WidgetData, WidgetConfig, PartnerBrand } from './types';

// ============================================================================
// PROPS
// ============================================================================

interface HomeWidgetsFeedProps {
  topInset?: number;
  bottomInset?: number;
  ListHeaderComponent?: React.ReactElement;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const HomeWidgetsFeed = memo(function HomeWidgetsFeed({
  topInset = 0,
  bottomInset = 0,
  ListHeaderComponent,
}: HomeWidgetsFeedProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { widgets, isLoadingMore, isRefreshing, hasMore, loadMore, refresh } = useHomeWidgets();

  const handleListingPress = useCallback(
    (id: string) => { router.push(`/listing/${id}` as any); },
    [router],
  );

  const handleFavoritePress = useCallback((_id: string) => {}, []);

  const handleViewAll = useCallback((_config: WidgetConfig) => {
    // TODO: Navigate to search with pre-filled params
  }, []);

  const handleBrandPress = useCallback((brand: PartnerBrand) => {
    router.push(`/listing/partner/${brand.slug}` as any);
  }, [router]);

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore) loadMore();
  }, [isLoadingMore, hasMore, loadMore]);

  const renderItem = useCallback(
    ({ item }: { item: WidgetData }) => (
      <WidgetCard
        config={item.config}
        listings={item.listings}
        isLoading={item.isLoading}
        onViewAll={handleViewAll}
        onListingPress={handleListingPress}
        onFavoritePress={handleFavoritePress}
        onBrandPress={handleBrandPress}
      />
    ),
    [handleViewAll, handleListingPress, handleFavoritePress, handleBrandPress],
  );

  const keyExtractor = useCallback((item: WidgetData) => item.config.id, []);

  return (
    <FlatList
      data={widgets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.list,
        { paddingTop: topInset, paddingBottom: bottomInset + 40 },
      ]}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.6}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.textSecondary}
          progressViewOffset={topInset}
        />
      }
      removeClippedSubviews
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
    />
  );
});

// ============================================================================
// SEPARATOR
// ============================================================================

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  list: { flexGrow: 1 },
  separator: { height: Spacing.lg },
});
