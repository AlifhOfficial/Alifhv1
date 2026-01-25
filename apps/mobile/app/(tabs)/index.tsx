/**
 * Browse Screen (Home Tab)
 * 
 * Main car listings feed with search and filters
 * Uses ScreenContainer for proper layout structure
 */

import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenContainer } from '@/components/layout';
import { BrowseHeader, BrowseHeaderSkeleton } from '@/components/browse';
import { CarCard, CarCardSkeleton } from '@/components/listings/car-card';
import { useSearch } from '@/hooks/useSearch';
import { useColor } from '@/hooks/useColor';

export default function BrowseScreen() {
  const { 
    listings, 
    facets, 
    meta,
    isLoading, 
    isRefreshing, 
    error, 
    hasMore, 
    params,
    activeFilterCount,
    setFilters,
    clearFilters,
    setSort,
    setSearch,
    refresh, 
    loadMore,
  } = useSearch();
  
  const primary = useColor('primary');

  // Render car card
  const renderItem = ({ item }: { item: typeof listings[0] }) => (
    <CarCard
      id={item.id}
      make={item.make || 'Unknown'}
      model={item.model || 'Model'}
      year={item.year || 2024}
      trim={item.trim}
      price={item.price || 0}
      mileage={item.mileage || 0}
      emirate={item.emirate || 'dubai'}
      specs={item.specs}
      thumbnail={item.thumbnail}
      isBlkListing={item.isBlkListing || false}
      partnerName={item.partnerName}
      partnerLogo={item.partnerLogo}
      partnerVerified={item.partnerVerified || false}
      isBlackTierPartner={item.isBlackTierPartner || false}
      sellerName={item.sellerName}
      sellerAvatarUrl={item.sellerAvatarUrl}
      kycVerified={item.sellerKycVerified || false}
      onPress={() => {
        console.log('Navigate to listing:', item.id);
      }}
    />
  );

  // Loading skeletons
  const renderSkeletons = () => (
    <View style={styles.skeletons}>
      {[1, 2, 3].map((i) => (
        <CarCardSkeleton key={i} />
      ))}
    </View>
  );

  // Footer loading indicator
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={primary} />
      </View>
    );
  };

  // Error state
  if (error && !isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text variant="section" style={styles.errorTitle}>Failed to load</Text>
          <Text variant="caption" muted style={styles.errorText}>{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      header={
        isLoading && listings.length === 0 ? (
          <BrowseHeaderSkeleton />
        ) : (
          <BrowseHeader
            params={params}
            facets={facets}
            meta={meta}
            activeFilterCount={activeFilterCount}
            isLoading={isLoading}
            onSearch={setSearch}
            onFiltersChange={setFilters}
            onSort={setSort}
            onClearFilters={clearFilters}
          />
        )
      }
    >
      {/* Loading state */}
      {isLoading && listings.length === 0 ? (
        renderSkeletons()
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="section">No listings found</Text>
              <Text variant="caption" muted>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  skeletons: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
