/**
 * BLK Screen - Premium Signature Line Collection
 * Full-screen view of Revvup's BLK premium car listings
 * Features dark luxury aesthetic with BLK doodle background
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Layout, ZIndex} from '@/constants/theme';
import { Body } from '@/components/ui';
import { BlkHeader, BLK_HEADER_HEIGHT, BlkCard, BlkCardSkeleton } from '@/components/blk';
import { searchApi, type ListingCard } from '@/lib/search-api';

// ============================================================================
// BLK SCREEN
// ============================================================================

export default function BlkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<FlatList<ListingCard>>(null);

  // State
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isLoadingMore = useRef(false);

  // Content top padding: safe area + header height + spacing
  const contentTopPadding = insets.top + BLK_HEADER_HEIGHT + Spacing.md;

  // ──────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async (cursor?: string | null, append: boolean = false) => {
    const requestId = ++requestIdRef.current;
    
    try {
      if (!append) {
        setIsLoading(true);
        setListings([]);
        setNextCursor(null);
      }

      const response = await searchApi.search({
        isBlkListing: true,
        sortBy: 'newest',
        cursor: cursor || undefined,
        limit: 20,
      });

      if (requestId !== requestIdRef.current) return;

      if (append) {
        setListings((prev) => {
          const existingIds = new Set(prev.map(l => l.id));
          const newListings = response.listings.filter(l => !existingIds.has(l.id));
          return [...prev, ...newListings];
        });
      } else {
        setListings(response.listings);
      }
      
      setHasMore(response.meta.hasMore);
      setNextCursor(response.meta.nextCursor ?? null);
    } catch (error) {
      console.error('[BLK] Search error:', error);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        isLoadingMore.current = false;
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchListings();
  }, [fetchListings]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && nextCursor && !isLoading && !isLoadingMore.current) {
      isLoadingMore.current = true;
      fetchListings(nextCursor, true);
    }
  }, [hasMore, nextCursor, isLoading, fetchListings]);

  const handleCardPress = useCallback((id: string) => {
    router.push(`/listing/${id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: ListingCard }) => (
    <View style={styles.cardWrapper}>
      <BlkCard
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
        partnerName={item.partnerName}
        partnerLogo={item.partnerLogo}
        partnerVerified={item.partnerVerified}
        isBlackTierPartner={item.isBlackTierPartner}
        sellerName={item.sellerName}
        sellerAvatarUrl={item.sellerAvatarUrl}
        kycVerified={item.sellerKycVerified}
        onPress={handleCardPress}
      />
    </View>
  ), [handleCardPress]);

  const keyExtractor = useCallback((item: ListingCard) => item.id, []);

  const renderEmpty = useCallback(() => {
    if (isLoading && listings.length === 0) {
      return (
        <>
          <View style={styles.cardWrapper}>
            <BlkCardSkeleton />
          </View>
          <View style={styles.cardWrapper}>
            <BlkCardSkeleton />
          </View>
          <View style={styles.cardWrapper}>
            <BlkCardSkeleton />
          </View>
        </>
      );
    }

    return (
      <View style={styles.empty}>
        <Body size="bodyLg" style={styles.emptyText}>No BLK listings available</Body>
      </View>
    );
  }, [isLoading, listings.length]);

  const renderFooter = useCallback(() => {
    if (!hasMore || !isLoadingMore.current) {
      return <View style={styles.bottomSpacer} />;
    }

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }, [hasMore]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Pure Black Background */}
      <LinearGradient
        colors={[Colors.dark.black, '#0A0A0A', Colors.dark.black]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* BLK Doodle Pattern - Behind everything */}

      {/* BLK Header - Absolute positioned (outside ScrollView) */}
      <BlkHeader />

      <FlatList
        ref={scrollRef}
        data={listings}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: contentTopPadding,
            paddingBottom: insets.bottom + Layout.tabBarHeight + Spacing.xl,
            flexGrow: listings.length === 0 ? 1 : undefined,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.dark.white}
            progressBackgroundColor={Colors.dark.black}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews
      />

      {/* Bottom Safe Area Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', Colors.dark.black]}
        locations={[0, 0.3, 0.7, 1]}
        style={[styles.bottomGradient, { height: insets.bottom + Layout.tabBarHeight + Spacing.xl }]}
        pointerEvents="none"
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
    backgroundColor: Colors.dark.black,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    color: Colors.dark.labelSecondary,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  bottomSpacer: {
    height: Spacing.lg,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.raised,
  },
});
