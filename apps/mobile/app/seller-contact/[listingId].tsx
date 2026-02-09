/**
 * Seller Contact Screen - Full seller/contact flow
 * Route: /seller-contact/[listingId]
 * 
 * Dedicated screen for seller interactions.
 * UI follows listing detail patterns: unapologetic, content-first, minimal cards.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing } from '@/constants/theme';
import { Label, Body, Supporting } from '@/components/ui/text';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { getListingDetailed, ListingDetailed } from '@/lib/listing-api';
import { normalizeSellerData, SellerInfo, getSellerListings, SellerListingCard } from '@/lib/seller-api';
import { createConversation } from '@/lib/messaging-api';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { PhoneActionSheet } from '@/components/sheets/phone-action-sheet';

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
  const { colorScheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme];

  const [listing, setListing] = useState<ListingDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [phoneSheetVisible, setPhoneSheetVisible] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [otherListings, setOtherListings] = useState<SellerListingCard[]>([]);
  const [otherListingsTotal, setOtherListingsTotal] = useState(0);
  const [showTopGradient, setShowTopGradient] = useState(false);
  
  // Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermMonths, setLoanTermMonths] = useState(48);
  const [interestRate] = useState(3.5);

  // Fetch listing data
  const fetchListing = useCallback(async (showRefreshing = false) => {
    if (!listingId) return;
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await getListingDetailed(listingId);
      setListing(data);
      
      // Fetch other listings from this seller
      const sellerId = data.sellerData.partnerId || data.sellerData.userId;
      if (sellerId) {
        try {
          const otherListingsRes = await getSellerListings(
            sellerId,
            data.sellerData.type,
            { limit: 4, excludeListingId: listingId }
          );
          setOtherListings(otherListingsRes.listings);
          setOtherListingsTotal(otherListingsRes.meta.total);
        } catch (err) {
          console.log('[SellerScreen] Failed to fetch other listings:', err);
        }
      }
    } catch (err) {
      console.error('[SellerScreen] Failed to fetch listing:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Normalize seller data
  const seller = useMemo<SellerInfo | null>(() => {
    if (!listing) return null;
    return normalizeSellerData(listing.sellerData);
  }, [listing]);

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

    const otherUserId = listing.sellerData.userId;
    if (!otherUserId) {
      Alert.alert('Error', 'Unable to contact seller at this time.');
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await createConversation({
        otherUserId,
        listingId,
        partnerId: listing.sellerData.partnerId ?? undefined,
      });
      router.push({
        pathname: '/chat/[conversationId]',
        params: { conversationId: response.conversationId },
      });
    } catch (err) {
      console.error('Failed to start chat:', err);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  }, [listing, listingId, isAuthenticated, router]);

  const handleBookViewing = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to book a viewing', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/profile') },
      ]);
      return;
    }
    Alert.alert('Coming Soon', 'Viewing appointments will be available soon!');
  }, [isAuthenticated, router]);

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
    Alert.alert('Coming Soon', 'Full seller inventory page coming soon!');
  }, []);

  // Handle scroll to show/hide top gradient
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowTopGradient(scrollY > 10);
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
          <Supporting size="medium">
            Unable to load seller information
          </Supporting>
        </View>
      </View>
    );
  }

  // Combined tags for display
  const combinedTags = [...seller.specialties, ...seller.badges];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Top Safe Area Gradient - visible on scroll */}
      {showTopGradient && <TopSafeAreaGradient />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content, 
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + 32 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchListing(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Seller Hero */}
        <SellerHero seller={seller} colors={colors} topInset={insets.top} />

        {/* About Section */}
        {seller.description && (
          <View style={styles.section}>
            <Label size="small" tone="muted">ABOUT</Label>
            <Body size="medium">{seller.description}</Body>
          </View>
        )}

        {/* Actions: Chat, Book, Phone */}
        <SellerActions
          seller={seller}
          isChatLoading={isChatLoading}
          onChat={handleChat}
          onBookViewing={handleBookViewing}
          onShowPhone={handleShowPhoneSheet}
          colors={colors}
        />

        {/* Stats Grid (private sellers only) */}
        <SellerStatsGrid
          seller={seller}
          listingsCount={otherListingsTotal + 1}
          colors={colors}
        />

        {/* User Tags (interests) for private sellers */}
        {!seller.isDealer && (
          <SellerTags
            tags={seller.tags}
            label="INTERESTS"
            colors={colors}
          />
        )}

        {/* Specialties & Badges */}
        <SellerTags
          tags={combinedTags}
          label={seller.isDealer ? 'SPECIALTIES' : 'BADGES'}
          colors={colors}
        />

        {/* Other Listings */}
        <SellerListings
          listings={otherListings}
          totalCount={otherListingsTotal}
          onViewListing={handleViewListing}
          onViewAll={handleViewAllListings}
          colors={colors}
        />

        {/* Financing Calculator */}
        <FinancingCalculator
          price={listing.listing.price}
          downPaymentPercent={downPaymentPercent}
          loanTermMonths={loanTermMonths}
          interestRate={interestRate}
          onDownPaymentChange={setDownPaymentPercent}
          onTermChange={setLoanTermMonths}
          colors={colors}
        />

        {/* Location & Website */}
        <SellerLocation
          seller={seller}
          onViewMap={handleViewOnMap}
          onGetDirections={handleGetDirections}
          onWebsite={handleWebsite}
          colors={colors}
        />
      </ScrollView>

      {/* Phone Action Sheet */}
      {seller.phone && (
        <PhoneActionSheet
          visible={phoneSheetVisible}
          onClose={() => setPhoneSheetVisible(false)}
          phoneNumber={seller.phone}
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
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
        <ChevronLeft size={24} color={colors.text} />
      </Pressable>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
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
