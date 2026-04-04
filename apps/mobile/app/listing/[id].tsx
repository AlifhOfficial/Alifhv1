/**
 * Listing Detail Screen - Individual Car Listing View
 * Route: /listing/[id]
 * 
 * Uses React Query for data fetching (caching, dedup, prefetch support).
 */

import { Bubble, ConfettiBurst, HapticRefreshControl, useFavoriteActions, EmptyState } from '@/components/ui';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, ScrollView, StyleSheet, InteractionManager, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Share2, Zap, AlertCircle, FileX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Sizes } from '@/constants/theme';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { useTheme } from '@/context/theme-context';
import { CarCardDetailedM, CarCardDetailedMSkeleton } from '@/components/cards';
import { useListingDetail } from '@/hooks/use-listing-query';
import { shareListing } from '@/lib/listing-share';
import { consumeDataReady, scheduleRenderPerf } from '@/lib/config';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);
  const listingId = id ?? '';
  
  // Data fetching via React Query (caching, dedup, view tracking)
  const { listing, isLoading, isRefreshing, error, refresh } = useListingDetail({
    listingId: id,
    trackView: true,
  });

  const [actionsReadyListingId, setActionsReadyListingId] = useState<string | null>(null);

  useEffect(() => {
    if (!listing?.listing.id) return;
    const currentListingId = listing.listing.id;

    const interaction = InteractionManager.runAfterInteractions(() => {
      setActionsReadyListingId(currentListingId);
    });

    return () => {
      interaction.cancel();
    };
  }, [listing?.listing.id]);

  useEffect(() => {
    if (!listing || !id) return;
    const readyAt = consumeDataReady(`listing:${id}`) ?? performance.now();
    scheduleRenderPerf('listing.detail-screen', readyAt, { listingId: id });
  }, [listing, id]);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleShare = useCallback(async () => {
    if (!listing || !listingId) return;
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const l = listing.listing;
      await shareListing({
        listingId: listingId,
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
  }, [listing, listingId]);

  const {
    isFavorite,
    isSuperliked,
    toggleFavorite,
    toggleSuperlike,
    favConfettiRef,
    superConfettiRef,
    showConfirmSheet,
    showExhaustedSheet,
    setShowConfirmSheet,
    setShowExhaustedSheet,
  } = useFavoriteActions(listingId);

  useEffect(() => {
    if (!showConfirmSheet) return;
    router.push({
      pathname: '/superlike-confirmation',
      params: {
        listingId,
        listingTitle: listing?.listing
          ? `${listing.listing.year} ${listing.listing.make} ${listing.listing.model}${listing.listing.trim ? ` ${listing.listing.trim}` : ''}`
          : undefined,
      },
    });
    setShowConfirmSheet(false);
  }, [listing?.listing, listingId, setShowConfirmSheet, showConfirmSheet]);

  useEffect(() => {
    if (!showExhaustedSheet) return;
    router.push({ pathname: '/superlike-exhausted', params: { listingId } });
    setShowExhaustedSheet(false);
  }, [listingId, setShowExhaustedSheet, showExhaustedSheet]);

  const headerActionsWidth = useMemo(() => {
    const actionSize = Sizes.actionButtonSm;
    return actionSize * 3 + Spacing.sm * 2;
  }, []);

  const headerActions = listing && actionsReadyListingId === listing.listing.id ? (
    <View style={styles.headerActions}>
      <View style={styles.actionItem}>
        <Bubble
          size="sm"
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Like listing"
          onPress={toggleFavorite}
        >
          <Heart
            size={Sizes.iconSm}
            color={isFavorite ? colors.favorite : colors.label}
            fill={isFavorite ? colors.favorite : 'none'}
            strokeWidth={isFavorite ? 2.25 : 1.75}
          />
        </Bubble>
        <ConfettiBurst ref={favConfettiRef} />
      </View>

      <View style={styles.actionItem}>
        <Bubble
          size="sm"
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Superlike listing"
          onPress={toggleSuperlike}
        >
          <Zap
            size={Sizes.iconSm}
            color={isSuperliked ? colors.warning : colors.label}
            fill={isSuperliked ? colors.warning : 'none'}
            strokeWidth={1.75}
          />
        </Bubble>
        <ConfettiBurst ref={superConfettiRef} />
      </View>

      <View style={styles.actionItem}>
        <Bubble
          size="sm"
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Share listing"
          onPress={handleShare}
        >
          <Share2 size={Sizes.iconSm} color={colors.label} strokeWidth={2} />
        </Bubble>
      </View>
    </View>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <MobileHeader
        title=""
        showBackButton
        right={headerActions}
        sideSlotWidth={headerActionsWidth}
        fadeHeight={insets.top + Spacing.xs}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerInset,
            paddingBottom: insets.bottom + Spacing['3xl'],
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        refreshControl={
          <HapticRefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {isLoading ? (
          <CarCardDetailedMSkeleton />
        ) : error ? (
          <EmptyState
            icon={error.message?.includes('not found') ? FileX : AlertCircle}
            title={error.message?.includes('not found') ? 'Listing not found.' : 'Something went wrong.'}
            subtitle={
              error.message?.includes('not found')
                ? 'This listing is no longer available or may have expired.'
                : 'We couldn\'t load this listing. Please try again.'
            }
          />
        ) : listing ? (
          <CarCardDetailedM 
            listing={listing.listing}
            sellerData={listing.sellerData}
            listingId={id!}
          />
        ) : null}
      </ScrollView>

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  actionItem: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
