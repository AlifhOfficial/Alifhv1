/**
 * Seller Hero Section
 * 
 * Displays dealer banner (if any) with avatar overlapping it, name,
 * verification badges, and member info.
 * Follows ProfileIdentity pattern for consistency.
 */

import { Text, BlkBadge } from '@/components/ui';
import { UserAvatar } from '@/components/ui/user-avatar';
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CheckCircle2, Star } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Timing, AspectRatio } from '@/constants/theme';
import { getAppThumbUrl } from '@/lib/config';
import type { SellerHeroProps } from './types';
import { formatMemberSince } from './utils';

const AVATAR_SIZE = Sizes.avatarLg * 2 + Spacing.lg; // xxl = 112

export const SellerHero = memo(function SellerHero({ seller, colors }: SellerHeroProps) {
  const avatarUrl = getAppThumbUrl(seller.avatar);
  const heroImageUrl = getAppThumbUrl(seller.heroImage);
  const hasBanner = !!(heroImageUrl && seller.isDealer);

  return (
    <Animated.View
      entering={FadeInDown.delay(50).duration(350)}
      style={styles.container}
    >
      {/* Banner behind avatar */}
      {hasBanner && (
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: heroImageUrl! }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={Timing.imageTransition}
          />
        </View>
      )}

      {/* Avatar — pulled up to overlap banner bottom */}
      <View style={[styles.avatarWrapper, hasBanner && styles.avatarOverlap]}>
        <UserAvatar
          src={avatarUrl}
          name={seller.name}
          size="xxl"
        />
      </View>

      <View style={styles.info}>
          {/* Name + Badges */}
          <View style={styles.nameRow}>
            <Text
              variant="title3Emphasized"
              style={styles.name}
              numberOfLines={1}
            >
              {seller.name}
            </Text>
            {seller.isVerified && seller.tier?.toLowerCase() !== 'black' && (
              <CheckCircle2
                size={Sizes.iconXs}
                color={colors.primary}
                strokeWidth={2.5}
              />
            )}
            {seller.tier?.toLowerCase() === 'black' && (
              <BlkBadge />
            )}
          </View>

          {/* Rating */}
          {seller.rating != null && (
            <View style={styles.ratingRow}>
              <Star size={Sizes.iconXs} color={colors.star} fill={colors.star} />
              <Text variant="body">{seller.rating.toFixed(1)}</Text>
              {seller.reviewCount != null && (
                <Text variant="body" tone="secondary">
                  ({seller.reviewCount} reviews)
                </Text>
              )}
            </View>
          )}

          {/* Member Since */}
          {seller.memberSince && (
            <Text variant="subhead" tone="muted">
              Member since {formatMemberSince(seller.memberSince)}
            </Text>
          )}
        </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: Spacing['3xl'],
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: AspectRatio.cardImage,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  avatarWrapper: {
    marginTop: Spacing.xl,
  },
  avatarOverlap: {
    marginTop: -(AVATAR_SIZE / 2),
  },
  info: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
