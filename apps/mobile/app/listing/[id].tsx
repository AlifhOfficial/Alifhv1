/**
 * Listing Detail Screen - Individual Car Listing View
 * Route: /listing/[id]
 * 
 * Uses React Query for data fetching (caching, dedup, prefetch support).
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl,
  Text,
  InteractionManager,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useTabBar } from '@/context/tab-bar-context';
import { CarCardDetailedM, CarCardDetailedMSkeleton } from '@/components/cards';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { FloatingListingActions } from '@/components/listings';
import { useListingDetail } from '@/hooks/use-listing-query';
import { shareListing } from '@/lib/listing-share';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const { hideChrome, showChrome } = useTabBar();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  // Data fetching via React Query (caching, dedup, view tracking)
  const { listing, isLoading, isRefreshing, error, refresh } = useListingDetail({
    listingId: id,
    trackView: true,
  });
  
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Handle scroll to show/hide top gradient
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextVisible = event.nativeEvent.contentOffset.y > 10;
    setShowTopGradient((current) => (current === nextVisible ? current : nextVisible));
  }, []);

  // Hide tab bar on this screen for immersive view
  useEffect(() => {
    hideChrome();
    return () => {
      showChrome();
    };
  }, [hideChrome, showChrome]);

  useEffect(() => {
    if (!listing) {
      setShowActions(false);
      return;
    }

    const interaction = InteractionManager.runAfterInteractions(() => {
      setShowActions(true);
    });

    return () => {
      interaction.cancel();
    };
  }, [listing]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleShare = useCallback(async (listingId: string) => {
    if (!listing) return;
    try {
      const carTitle = `${listing.listing.year} ${listing.listing.make} ${listing.listing.model}`;
      await shareListing({ listingIdOrSlug: listingId, title: carTitle });
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
        scrollEventThrottle={32}
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
              {error.message?.includes('not found') 
                ? 'This listing is no longer available or may have expired'
                : 'Failed to load listing. Please try again.'}
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
      {listing && showActions && (
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
