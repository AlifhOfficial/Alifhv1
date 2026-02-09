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

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useTabBar } from '@/context/tab-bar-context';
import { CarCardDetailedM, CarCardDetailedMSkeleton } from '@/components/cards';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { listingApi, ListingDetailed } from '@/lib/listing-api';

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
    } catch (err) {
      console.error('Failed to fetch listing:', err);
      setError('Failed to load listing');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleRefresh = useCallback(() => {
    fetchListing(true);
  }, [fetchListing]);

  const handleShare = useCallback(async () => {
    if (!listing) return;
    try {
      const carTitle = `${listing.listing.year} ${listing.listing.make} ${listing.listing.model}`;
      const shareUrl = `https://revvup.ae/listing/${id}`;
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        await Share.share({
          title: carTitle,
          message: `Check out this ${carTitle} on Revvup!\n${shareUrl}`,
          url: shareUrl,
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [listing, id]);

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
          { paddingBottom: insets.bottom + Spacing['3xl'] },
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
    paddingTop: 100,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
});
