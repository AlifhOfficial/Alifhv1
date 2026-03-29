/**
 * Listing Detail Screen - Individual Car Listing View
 * Route: /listing/[id]
 * 
 * Uses React Query for data fetching (caching, dedup, prefetch support).
 */

import { Text } from '@/components/ui';
import { useEffect, useState, useCallback } from 'react';
import { 
  View, ScrollView, StyleSheet, RefreshControl, InteractionManager } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { useTheme } from '@/context/theme-context';
import { CarCardDetailedM, CarCardDetailedMSkeleton } from '@/components/cards';
import { FloatingListingActions } from '@/components/listings';
import { useListingDetail } from '@/hooks/use-listing-query';
import { shareListing } from '@/lib/listing-share';
import { consumeDataReady, scheduleRenderPerf } from '@/lib/config';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  
  // Data fetching via React Query (caching, dedup, view tracking)
  const { listing, isLoading, isRefreshing, error, refresh } = useListingDetail({
    listingId: id,
    trackView: true,
  });
  
  const [showActions, setShowActions] = useState(false);

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

  useEffect(() => {
    if (!listing || !id) return;
    const readyAt = consumeDataReady(`listing:${id}`) ?? performance.now();
    scheduleRenderPerf('listing.detail-screen', readyAt, { listingId: id });
  }, [listing, id]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleShare = useCallback(async (listingId: string) => {
    if (!listing) return;
    try {
      const l = listing.listing;
      await shareListing({
        listingId,
        year: l.year,
        make: l.make,
        model: l.model,
        trim: l.trim,
        price: l.price,
        mileage: l.mileage,
        emirate: l.emirate,
        specs: l.specs,
      });
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
      <MobileHeader title="" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerInset,
            paddingBottom: insets.bottom + Spacing['3xl'] + Sizes.actionButtonLg + Spacing['3xl'],
          },
        ]}
        showsVerticalScrollIndicator={false}
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
            <Text variant="subhead" tone="secondary" style={{ textAlign: 'center' }}>
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
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing.lg,
  },
});
