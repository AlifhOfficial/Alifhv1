/**
 * Similar Listings Section
 *
 * Horizontally scrollable price-range similar listings.
 */

import { Text, Skeleton } from '@/components/ui';
import React, { memo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Spacing, Radius, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { CarCardM } from '@/components/cards/car-card-m';
import { useRouter } from 'expo-router';
import { useSimilarListings } from '@/hooks/use-listing-query';

const CARD_WIDTH = Dimensions.get('window').width * 0.62;

interface SimilarListingsProps {
  listingId: string;
}

export const SimilarListings = memo(function SimilarListings({ listingId }: SimilarListingsProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { listings, isLoading } = useSimilarListings(listingId);

  const handlePress = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <Skeleton width={140} height={12} />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, width: CARD_WIDTH }]}>
              <Skeleton width="100%" height={CARD_WIDTH * 0.65} borderRadius={Radius['2xl']} />
              <View style={styles.skeletonBody}>
                <Skeleton width="65%" height={13} />
                <Skeleton width="40%" height={12} />
                <Skeleton width="35%" height={13} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (listings.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.container}>
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Similar Price Range</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + Spacing.sm}
        snapToAlignment="start"
      >
        {listings.map((item) => (
          <View key={item.id} style={{ width: CARD_WIDTH }}>
            <CarCardM
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
              isBlkListing={item.isBlkListing}
              partnerName={item.partnerName}
              partnerLogo={item.partnerLogo}
              partnerVerified={item.partnerVerified ?? false}
              isBlackTierPartner={item.isBlackTierPartner}
              sellerName={item.sellerName}
              sellerAvatarUrl={item.sellerAvatarUrl}
              onPress={handlePress}
            />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  skeletonCard: {
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  skeletonBody: {
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
});
