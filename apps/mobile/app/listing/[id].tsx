/**
 * Listing Detail Screen - Individual Car Listing View
 * Route: /listing/[id]
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  Text,
  Share,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography, Layout, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useTabBar } from '@/context/tab-bar-context';
import { CarCardDetailedM, CarCardDetailedMSkeleton } from '@/components/cards';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { FloatingListingActions } from '@/components/listings';
import { listingApi, ListingDetailed } from '@/lib/listing-api';
import { useRef } from 'react';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { hideChrome, showChrome } = useTabBar();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  const [listing, setListing] = useState<ListingDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const viewTrackedRef = useRef(false);

  // Handle scroll to show/hide top gradient
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowTopGradient(scrollY > 10);
  }, []);

  // Hide tab bar on this screen for immersive view
  useEffect(() => {
    hideChrome();
    return () => {
      showChrome();
    };
  }, [hideChrome, showChrome]);

  const fetchListing = useCallback(async (showRefreshing = false) => {
    if (!id) return;
    
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await listingApi.getDetailed(id);
      setListing(data);
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        console.log('[ListingScreen] Listing not found or expired:', id);
        setError('This listing is no longer available or may have expired');
      } else {
        console.error('Failed to fetch listing:', err);
        setError('Failed to load listing. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Track view when listing loads successfully (fire-and-forget)
  // Only track for live/public listings - not admin previews
  useEffect(() => {
    const isPublic = listing?.listing?.isPublic ?? false;
    const isAdminPreview = listing?.isAdminPreview ?? false;
    if (listing?.listing?.id && isPublic && !isAdminPreview && !viewTrackedRef.current) {
      viewTrackedRef.current = true;
      listingApi.trackView(listing.listing.id);
    }
  }, [listing?.listing?.id, listing?.listing?.isPublic, listing?.isAdminPreview]);

  const handleRefresh = useCallback(() => {
    fetchListing(true);
  }, [fetchListing]);

  const handleShare = useCallback(async (listingId: string) => {
    if (!listing) return;
    try {
      const carTitle = `${listing.listing.year} ${listing.listing.make} ${listing.listing.model}`;
      const shareUrl = `https://revvup.ae/listings/${listingId}`;
      if (Platform.OS === 'web') {
        if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
        }
      } else if (Platform.OS === 'ios') {
        // iOS automatically appends URL to message, so don't include in message
        await Share.share({
          title: carTitle,
          message: `Check out this ${carTitle} on Revvup!`,
          url: shareUrl,
        });
      } else {
        // Android doesn't use url parameter, include in message
        await Share.share({
          title: carTitle,
          message: `Check out this ${carTitle} on Revvup!\n${shareUrl}`,
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [listing]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Top Safe Area Gradient - visible on scroll */}
      {showTopGradient && <TopSafeAreaGradient />}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing['3xl'] + Sizes.actionButtonLg + Spacing['3xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          <CarCardDetailedMSkeleton />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {error}
            </Text>
          </View>
        ) : listing ? (
          <CarCardDetailedM 
            listing={listing.listing}
            sellerData={listing.sellerData}
            listingId={id!}
          />
        ) : null}
      </ScrollView>

      {/* Floating Listing Actions - uses useFavoriteActions internally */}
      {listing && (
        <FloatingListingActions
          id={id!}
          onSharePress={handleShare}
        />
      )}

      {/* Bottom Safe Area Gradient */}
      <BottomSafeAreaGradient />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['5xl'],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['5xl'] * 2,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    textAlign: 'center',
  },
});
