/**
 * BLK Screen - Premium Signature Line Collection
 * Full-screen view of Revvup's BLK premium car listings
 * Features dark luxury aesthetic with BLK doodle background
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Spacing, Layout } from '@/constants/theme';
import { Body, LogoLoader } from '@/components/ui';
import { BlkTextDoodle } from '@/components/home/blk-text-doodle';
import { BlkHeader, BLK_HEADER_HEIGHT, BlkCard, BlkCardSkeleton } from '@/components/blk';
import { searchApi, type ListingCard } from '@/lib/search-api';

// ============================================================================
// BLK SCREEN
// ============================================================================

export default function BlkScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // State
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const requestIdRef = useRef(0);
  const isLoadingMore = useRef(false);

  // Content top padding: safe area + header height + spacing
  const contentTopPadding = insets.top + BLK_HEADER_HEIGHT + Spacing.md;

  // ──────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ──────────────────────────────────────────────────────────────────────────

  const fetchListings = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    const requestId = ++requestIdRef.current;
    
    try {
      if (!append) {
        setIsLoading(true);
        setListings([]);
      }

      const response = await searchApi.search({
        isBlkListing: true,
        sortBy: 'newest',
        page: pageNum,
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
      
      setTotal(response.meta.total);
      setHasMore(response.meta.hasMore);
      setPage(pageNum);
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
    fetchListings(1);
  }, [fetchListings]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore.current) {
      isLoadingMore.current = true;
      fetchListings(page + 1, true);
    }
  }, [hasMore, isLoading, page, fetchListings]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const handleCardPress = useCallback((id: string) => {
    router.push(`/listing/${id}` as any);
  }, [router]);

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Pure Black Background */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* BLK Doodle Pattern - Behind everything */}
      <BlkTextDoodle />

      {/* BLK Header - Absolute positioned (outside ScrollView) */}
      <BlkHeader total={total} />

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: contentTopPadding,
            paddingBottom: insets.bottom + Layout.tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#FAFAFA"
            progressBackgroundColor="#000000"
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {isLoading && listings.length === 0 ? (
          // Skeletons
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
        ) : listings.length === 0 ? (
          // Empty state
          <View style={styles.empty}>
            <Body size="large" style={styles.emptyText}>No BLK listings available</Body>
          </View>
        ) : (
          // Listings
          <>
            {listings.map((listing, index) => (
              <View key={`${listing.id}-${index}`} style={styles.cardWrapper}>
                <BlkCard
                  id={listing.id}
                  make={listing.make}
                  model={listing.model}
                  year={listing.year}
                  trim={listing.trim}
                  price={listing.price}
                  mileage={listing.mileage}
                  emirate={listing.emirate}
                  specs={listing.specs}
                  thumbnail={listing.thumbnail}
                  partnerName={listing.partnerName}
                  partnerLogo={listing.partnerLogo}
                  partnerVerified={listing.partnerVerified}
                  isBlackTierPartner={listing.isBlackTierPartner}
                  sellerName={listing.sellerName}
                  sellerAvatarUrl={listing.sellerAvatarUrl}
                  kycVerified={listing.sellerKycVerified}
                  onPress={handleCardPress}
                />
              </View>
            ))}

            {/* Loading more indicator */}
            {hasMore && isLoadingMore.current && (
              <View style={styles.loadingMore}>
                <LogoLoader size={40} />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Safe Area Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', '#000000']}
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
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
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
    color: 'rgba(255,255,255,0.5)',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
