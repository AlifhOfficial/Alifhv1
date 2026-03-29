/**
 * Seller Contact Screen - Full seller/contact flow
 * Route: /seller-contact/[listingId]
 * 
 * Uses React Query for data fetching (shares cache with listing detail screen).
 * UI follows listing detail patterns: unapologetic, content-first, minimal cards.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Pressable, Alert, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, Colors, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useSearch } from '@/context/search-context';
import { useListingDetail, useSellerListings } from '@/hooks/use-listing-query';
import { normalizeSellerData, SellerInfo } from '@/lib/seller-api';
import { createConversation } from '@/lib/messaging-api';
import { PhoneActionSheet, FinancingSheet, BookingSheet, SellerDescriptionSheet } from '@/components/sheets';

// Modular components
import {
  SellerHero,
  SellerActions,
  SellerStatsGrid,
  SellerTags,
  SellerListings,
  FinancingCalculator,
  SellerLocation,
  SellerContactSkeleton,
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

  // Data fetching via React Query (shares cache with listing detail screen!)
  const { listing, isLoading, isRefreshing, refresh } = useListingDetail({
    listingId,
    trackView: false, // Don't track view on seller contact screen
  });
  
  // Derive seller ID/type from listing for other listings query
  const sellerId = listing?.sellerData?.partnerId || listing?.sellerData?.userId;
  const sellerType = listing?.sellerData?.type;
  
  // Fetch other listings from this seller
  const { listings: otherListings, total: otherListingsTotal } = useSellerListings({
    sellerId,
    sellerType,
    excludeListingId: listingId,
    limit: 4,
    enabled: !!sellerId && !!sellerType,
  });

  const [phoneSheetVisible, setPhoneSheetVisible] = useState(false);
  const [financingSheetVisible, setFinancingSheetVisible] = useState(false);
  const [bookingSheetVisible, setBookingSheetVisible] = useState(false);
  const [descriptionSheetVisible, setDescriptionSheetVisible] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(48);
  const [interestRate] = useState(3.5);

  // Normalize seller data
  const seller = useMemo<SellerInfo | null>(() => {
    if (!listing) return null;
    return normalizeSellerData(listing.sellerData);
  }, [listing]);

  // Check if this is the user's own listing
  const isOwnListing = !!(user?.id && listing?.sellerData?.userId === user.id);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShowPhoneSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhoneSheetVisible(true);
  }, []);

  const handleChat = useCallback(async () => {
    if (!listing || !listingId) return;

    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to message the seller', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/profile') },
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
    if (otherUserId === user?.id) {
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
  }, [listing, listingId, seller, isAuthenticated, router]);

  const handleBookViewing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBookingSheetVisible(true);
  }, []);

  const handleBookingLoginRequired = useCallback(() => {
    setBookingSheetVisible(false);
    Alert.alert('Sign In Required', 'Please sign in to book a test drive', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign In', onPress: () => router.push('/profile') },
    ]);
  }, [router]);

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

  const handleCustomizeFinancing = useCallback(() => {
    setFinancingSheetVisible(true);
  }, []);

  const handleApplyCustomFinancing = useCallback((dp: number, term: number) => {
    setDownPaymentPercent(dp);
    setLoanTermMonths(term);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header colors={colors} insets={insets} onBack={handleBack} />
        <SellerContactSkeleton colors={colors} />
      </View>
    );
  }

  // Error state
  if (!listing || !seller) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header colors={colors} insets={insets} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text variant="body" tone="secondary">
            This listing is no longer available or may have expired
          </Text>
        </View>
      </View>
    );
  }

  // Combined tags for display
  const combinedTags = [...seller.specialties, ...seller.badges];
  const flatListData = useMemo(() => [{ key: 'seller-contact-body' }], []);
  const sellerContentPaddingTop = insets.top + Spacing.lg;
  const sellerContentPaddingBottom = insets.bottom + Layout.bottomGradientExtension + Spacing.xl;

  const sellerContent = useMemo(() => (
    <View style={styles.sectionStack}>
      <SellerHero seller={seller} colors={colors} topInset={insets.top} />

      {seller.description && (
        <Pressable
          style={styles.section}
          onPress={() => setDescriptionSheetVisible(true)}
        >
          <Text variant="label" tone="muted" uppercase>ABOUT</Text>
          <Text variant="body" tone="secondary" numberOfLines={3}>
            {seller.description}
          </Text>
          {seller.description.length > 120 && (
            <Text variant="bodySm" tone="primary">Read more</Text>
          )}
        </Pressable>
      )}

      {!isOwnListing && (
        <SellerActions
          seller={seller}
          isChatLoading={isChatLoading}
          onChat={handleChat}
          onBookViewing={handleBookViewing}
          onShowPhone={handleShowPhoneSheet}
        />
      )}

      <SellerStatsGrid
        seller={seller}
        listingsCount={otherListingsTotal + 1}
        colors={colors}
      />

      {!seller.isDealer && (
        <SellerTags
          tags={seller.tags}
          label="INTERESTS"
          colors={colors}
        />
      )}

      <SellerTags
        tags={combinedTags}
        label={seller.isDealer ? 'SPECIALTIES' : 'BADGES'}
        colors={colors}
      />

      <SellerListings
        listings={otherListings}
        totalCount={otherListingsTotal}
        onViewListing={handleViewListing}
        onViewAll={handleViewAllListings}
        colors={colors}
      />

      <FinancingCalculator
        price={listing.listing.price}
        downPaymentPercent={downPaymentPercent}
        loanTermMonths={loanTermMonths}
        interestRate={interestRate}
        onDownPaymentChange={setDownPaymentPercent}
        onTermChange={setLoanTermMonths}
        onCustomize={handleCustomizeFinancing}
        colors={colors}
      />

      <SellerLocation
        seller={seller}
        onViewMap={handleViewOnMap}
        onGetDirections={handleGetDirections}
        onWebsite={handleWebsite}
        colors={colors}
      />
    </View>
  ), [
    colors,
    combinedTags,
    downPaymentPercent,
    handleBookViewing,
    handleChat,
    handleCustomizeFinancing,
    handleGetDirections,
    handleShowPhoneSheet,
    handleViewAllListings,
    handleViewListing,
    handleViewOnMap,
    handleWebsite,
    insets.top,
    interestRate,
    isChatLoading,
    isOwnListing,
    listing.listing.price,
    loanTermMonths,
    otherListings,
    otherListingsTotal,
    seller,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <FlatList
        data={flatListData}
        renderItem={() => null}
        ListHeaderComponent={sellerContent}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: sellerContentPaddingTop,
            paddingBottom: sellerContentPaddingBottom,
            paddingHorizontal: Spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
          />
        }
      />

      {/* Phone Action Sheet */}
      {seller.phone && (
        <PhoneActionSheet
          visible={phoneSheetVisible}
          onClose={() => setPhoneSheetVisible(false)}
          phoneNumber={seller.phone}
        />
      )}

      {/* Booking Sheet */}
      {listing && (
        <BookingSheet
          visible={bookingSheetVisible}
          onClose={() => setBookingSheetVisible(false)}
          listingId={listingId!}
          listingTitle={`${listing.listing.year} ${listing.listing.make} ${listing.listing.model}`}
          isAuthenticated={isAuthenticated}
          onLoginRequired={handleBookingLoginRequired}
        />
      )}

      {/* Financing Sheet */}
      <FinancingSheet
        visible={financingSheetVisible}
        onClose={() => setFinancingSheetVisible(false)}
        initialDownPayment={downPaymentPercent}
        initialTerm={loanTermMonths}
        price={listing.listing.price}
        interestRate={interestRate}
        onApply={handleApplyCustomFinancing}
      />

      {/* Seller Description Sheet */}
      {seller.description && (
        <SellerDescriptionSheet
          visible={descriptionSheetVisible}
          onClose={() => setDescriptionSheetVisible(false)}
          description={seller.description}
          sellerName={seller.name}
        />
      )}
    </View>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

function Header({
  colors,
  insets,
  onBack,
}: {
  colors: typeof Colors.light;
  insets: { top: number };
  onBack: () => void;
}) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
      <HapticPressable style={styles.backBtn} onPress={onBack} hitSlop={Layout.hitSlop}>
        <ChevronLeft size={Sizes.iconLg} color={colors.label} />
      </HapticPressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: Layout.hitTarget,
    height: Layout.hitTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
  },
  sectionStack: {
    gap: Spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: Spacing.sm,
  },
});
