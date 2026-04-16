/**
 * Seller Contact Screen - Full seller/contact flow
 * Route: /seller-contact/[listingId]
 * 
 * Uses React Query for data fetching (shares cache with listing detail screen).
 * UI follows listing detail patterns: unapologetic, content-first, minimal cards.
 */

import { Text, Skeleton, SkeletonCircle, HapticRefreshControl } from '@/components/ui';
import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Spacing, Layout, Radius, Sizes } from '@/constants/theme';
import { MobileHeader, getMobileHeaderContentInset } from '@/components/layout';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { useListingDetail, useSellerListings } from '@/hooks/use-listing-query';
import { normalizeSellerData, SellerInfo } from '@/lib/seller-api';
import { createConversation } from '@/lib/messaging-api';

// Modular components
import {
  SellerHero,
  SellerAbout,
  SellerSpecialties,
  SellerActions,
  SellerStatsGrid,
  SellerTags,
  SellerListings,
  SellerLocation,
  safeOpenURL,
} from '@/components/seller-contact';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SellerContactScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { applySearch, clearSearch, clearFilterParams } = useSearch();
  const insets = useSafeAreaInsets();
  const headerInset = getMobileHeaderContentInset(insets.top);

  // Data fetching via React Query (shares cache with listing detail screen!)
  const { listing, isLoading, isRefreshing, refresh } = useListingDetail({
    listingId,
    trackView: false, // Don't track view on seller contact screen
  });
  
  // Derive seller ID/type from listing for other listings query
  const sellerId = listing?.sellerData?.partnerId || listing?.sellerData?.userId;
  const sellerType = listing?.sellerData?.type;
  
  // Fetch other listings from this seller
  const { listings: otherListings } = useSellerListings({
    sellerId,
    sellerType,
    excludeListingId: listingId,
    limit: 4,
    enabled: !!sellerId && !!sellerType,
  });

  const [isChatLoading, setIsChatLoading] = useState(false);

  // Normalize seller data
  const seller = useMemo<SellerInfo | null>(() => {
    if (!listing) return null;
    return normalizeSellerData(listing.sellerData);
  }, [listing]);

  // Check if this is the user's own listing
  const isOwnListing = !!(user?.id && listing?.sellerData?.userId === user.id);
  const currentUserId = user?.id;

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShowPhoneSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!seller?.phone) return;
    router.push({
      pathname: '/phone-actions',
      params: { phoneNumber: seller.phone },
    });
  }, [router, seller?.phone]);

  const handleChat = useCallback(async () => {
    if (!listing || !listingId) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to message the seller', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign In',
          onPress: () => router.push({ pathname: '/auth-prompt', params: { context: 'messages' } }),
        },
      ]);
      return;
    }

    // For partner listings, userId is on the listing itself (assigned staff member)
    // For user listings, it's available on both listing.listing.userId and sellerData.userId
    const otherUserId = listing.listing.userId || listing.sellerData.userId;
    if (!otherUserId) {
      Alert.alert('Error', 'Unable to contact seller at this time.');
      return;
    }

    // Prevent messaging yourself (own listing)
    if (otherUserId === currentUserId) {
      Alert.alert('Your Listing', 'You cannot message yourself on your own listing.');
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await createConversation({
        otherUserId,
        listingId,
        partnerId: listing.sellerData.partnerId ?? undefined,
      });
      
      // Build conversation data to pass to chat screen (avoids refetch)
      const listingData = listing.listing;
      const listingTitle = `${listingData.year} ${listingData.make} ${listingData.model}`;
      const listingThumbnail = listingData.thumbnail || listingData.images?.[0] || null;
      
      const conversationData = {
        id: response.conversationId,
        type: listing.sellerData.partnerId ? 'listing' : 'direct',
        status: 'active',
        listingId,
        partnerId: listing.sellerData.partnerId ?? null,
        subject: null,
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: null,
        messageCount: 0,
        unreadCount: 0,
        isArchived: false,
        isMuted: false,
        isPinned: false,
        otherParticipant: {
          id: otherUserId,
          name: seller?.name ?? null,
          avatarUrl: seller?.avatar ?? null,
        },
        listing: {
          id: listingId,
          title: listingTitle,
          thumbnail: listingThumbnail,
        },
        partner: listing.sellerData.partnerId && listing.sellerData.partner ? {
          id: listing.sellerData.partnerId,
          name: listing.sellerData.partner.brandName ?? seller?.name ?? '',
          logo: listing.sellerData.partner.logo ?? null,
        } : null,
      };
      
      router.push({
        pathname: '/chat/[conversationId]',
        params: { 
          conversationId: response.conversationId,
          conversationData: JSON.stringify(conversationData),
        },
      });
    } catch (err) {
      console.error('Failed to start chat:', err);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  }, [listing, listingId, seller, isAuthenticated, router, currentUserId]);

  const handleBookViewing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to book a test drive', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign In',
          onPress: () => router.push({ pathname: '/auth-prompt', params: { context: 'listings' } }),
        },
      ]);
      return;
    }

    if (!listing) return;

    router.push({
      pathname: '/booking',
      params: {
        listingId,
        listingTitle: `${listing.listing.year} ${listing.listing.make} ${listing.listing.model}`,
      },
    });
  }, [isAuthenticated, listing, listingId, router]);

  const handleViewOnMap = useCallback(async () => {
    if (!seller) return;
    const query = seller.lat && seller.lng
      ? `${seller.lat},${seller.lng}`
      : encodeURIComponent(seller.location || seller.name);
    await safeOpenURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      'Unable to open maps.'
    );
  }, [seller]);

  const handleGetDirections = useCallback(async () => {
    if (!seller) return;
    const dest = seller.lat && seller.lng
      ? `${seller.lat},${seller.lng}`
      : encodeURIComponent(seller.location || seller.name);
    await safeOpenURL(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      'Unable to open maps.'
    );
  }, [seller]);

  const handleWebsite = useCallback(async () => {
    if (!seller?.website) return;
    let url = seller.website;
    if (!url.startsWith('http')) url = `https://${url}`;
    await safeOpenURL(url, 'Unable to open website.');
  }, [seller?.website]);

  const handleViewListing = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleViewAllListings = useCallback(() => {
    if (!seller) return;
    
    // Clear existing search/filters and apply seller filter
    clearSearch();
    clearFilterParams();
    
    if (seller.type === 'partner') {
      // Dealers use partnerId
      applySearch({
        partnerId: seller.id,
        partnerName: seller.name,
      });
    } else {
      // Private sellers use sellerId
      applySearch({
        sellerId: seller.id,
        sellerName: seller.name,
      });
    }
    // Navigate to browse tab
    router.push('/(tabs)/(browse)');
  }, [seller, applySearch, clearSearch, clearFilterParams, router]);

  // Combined tags for display — must be before early returns (used in sellerContent memo)
  const combinedTags = useMemo(
    () => [...(seller?.specialties ?? []), ...(seller?.badges ?? [])],
    [seller?.specialties, seller?.badges]
  );
  const flatListData = useMemo(() => [{ key: 'seller-contact-body' }], []);
  const sellerContentPaddingBottom = insets.bottom + Layout.bottomGradientExtension + Spacing.xl;

  const sellerContent = useMemo(() => {
    if (!seller) return null;
    return (
      <View style={styles.sectionStack}>
        <SellerHero seller={seller} colors={colors} />

        {!isOwnListing && (
          <SellerActions
            seller={seller}
            isChatLoading={isChatLoading}
            onChat={handleChat}
            onBookViewing={handleBookViewing}
            onShowPhone={handleShowPhoneSheet}
          />
        )}

        {seller.description && (
          <SellerAbout
            description={seller.description}
            onReadMore={() => {
              router.push({
                pathname: '/seller-description',
                params: {
                  description: seller.description,
                  sellerName: seller.name,
                },
              });
            }}
            colors={colors}
          />
        )}

        {combinedTags.length > 0 && (
          <SellerSpecialties
            specialties={combinedTags}
            colors={colors}
          />
        )}

        <SellerStatsGrid
          seller={seller}
          colors={colors}
        />

        {!seller.isDealer && seller.tags.length > 0 && (
          <SellerTags
            tags={seller.tags}
            label="INTERESTS"
            colors={colors}
          />
        )}

        <SellerLocation
          seller={seller}
          onViewMap={handleViewOnMap}
          onGetDirections={handleGetDirections}
          onWebsite={handleWebsite}
          colors={colors}
        />

        <SellerListings
          listings={otherListings}
          onViewListing={handleViewListing}
          onViewAll={handleViewAllListings}
          colors={colors}
        />
      </View>
    );
  }, [
    colors,
    combinedTags,
    handleBookViewing,
    handleChat,
    handleGetDirections,
    handleShowPhoneSheet,
    handleViewAllListings,
    handleViewListing,
    handleViewOnMap,
    handleWebsite,
    isChatLoading,
    isOwnListing,
    otherListings,
    router,
    seller,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <MobileHeader
          title="Seller"
          showBackButton
          onBackPress={handleBack}
          fadeHeight={insets.top + Spacing.xs}
        />
        <View style={[styles.skeletonContainer, { paddingHorizontal: Spacing.lg, paddingTop: headerInset + Spacing.lg }]}>
          {/* Hero */}
          <View style={styles.skeletonHero}>
            <Skeleton width="100%" height={Sizes.cardThumbnailHeight} borderRadius={Radius.xl} />
            <SkeletonCircle size={Sizes.avatarLg * 2} />
            <View style={styles.skeletonHeroText}>
              <Skeleton width={160} height={20} />
              <Skeleton width={100} height={14} />
            </View>
          </View>
          {/* Actions */}
          <Skeleton width="100%" height={140} borderRadius={Radius.xl} />
          {/* About */}
          <Skeleton width="100%" height={100} borderRadius={Radius.xl} />
          {/* Specialties / Tags */}
          <Skeleton width="100%" height={160} borderRadius={Radius.xl} />
          {/* Stats */}
          <Skeleton width="100%" height={100} borderRadius={Radius.xl} />
          {/* Listings */}
          <Skeleton width="100%" height={200} borderRadius={Radius.xl} />
        </View>
      </View>
    );
  }

  // Error state
  if (!listing || !seller) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <MobileHeader
          title="Seller"
          showBackButton
          onBackPress={handleBack}
          fadeHeight={insets.top + Spacing.xs}
        />
        <View style={styles.errorContainer}>
          <Text variant="body" tone="secondary">
            This listing is no longer available or may have expired
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <MobileHeader
        title=""
        showBackButton
        onBackPress={handleBack}
        fadeHeight={insets.top + Spacing.xs}
      />
      
      <FlatList
        data={flatListData}
        renderItem={() => null}
        ListHeaderComponent={sellerContent}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerInset + Spacing.lg,
            paddingBottom: sellerContentPaddingBottom,
            paddingHorizontal: Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <HapticRefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
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
  content: {
  },
  sectionStack: {
    gap: Spacing.xl,
  },
  skeletonContainer: {
    flex: 1,
    gap: Spacing.xl,
  },
  skeletonHero: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  skeletonHeroText: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
