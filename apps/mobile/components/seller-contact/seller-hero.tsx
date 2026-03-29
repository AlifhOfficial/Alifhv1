/**
 * Seller Hero Section
 * 
 * Displays seller hero image, name, avatar, verification badges, and member info.
 * Follows listings component patterns for consistency.
 */

import { Text } from '@/components/ui';
import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, Clock, Star } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { getAppThumbUrl } from '@/lib/config';
import type { SellerHeroProps } from './types';
import { formatMemberSince } from './utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = SCREEN_WIDTH * 0.65;
const AVATAR_SIZE = Sizes.avatarLg + Spacing.sm;
export const SellerHero = memo(function SellerHero({ seller, colors }: SellerHeroProps) {
  // Convert to CDN URLs
  const heroImageUrl = getAppThumbUrl(seller.heroImage);
  const avatarUrl = getAppThumbUrl(seller.avatar);
  const hasHeroImage = heroImageUrl && seller.isDealer;
  
  return (
    <>
      <View style={localStyles.heroSection}>
        <View style={localStyles.heroInfo}>
          <View style={localStyles.nameRow}>
            <Text variant="title3Emphasized" numberOfLines={1} style={{ flexShrink: 1 }}>
              {seller.name}
            </Text>
            {seller.isVerified && seller.tier?.toLowerCase() !== 'black' ? (
              <CheckCircle2 size={Sizes.iconXs} color={colors.primary} />
            ) : null}
            {seller.tier?.toLowerCase() === 'black' ? (
              <View style={[localStyles.tierBadge, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder }]}>
                <Text variant="caption1Emphasized" uppercase={false} style={{ color: colors.blkBadgeFg }}>
                  BLK
                </Text>
              </View>
            ) : null}
          </View>

          {seller.rating != null ? (
            <View style={localStyles.ratingRow}>
              <Star size={Sizes.iconXs} color={colors.warning} fill={colors.warning} />
              <Text variant="subhead">{seller.rating.toFixed(1)}</Text>
              {seller.reviewCount != null ? (
                <Text variant="subhead" tone="secondary">
                  ({seller.reviewCount})
                </Text>
              ) : null}
            </View>
          ) : null}

          {seller.memberSince ? (
            <View style={localStyles.metaRow}>
              <Clock size={Sizes.iconXs} color={colors.labelSecondary} />
              <Text variant="subhead" tone="muted">
                Member since {formatMemberSince(seller.memberSince)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[localStyles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={localStyles.avatarImage} contentFit="cover" />
          ) : (
            <Text variant="title2Emphasized" tone="secondary">
              {seller.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Hero/Cover Image - Dealers only, inset as a rounded banner */}
      {hasHeroImage && (
        <View style={localStyles.heroImageContainer}>
          <Image
            source={{ uri: heroImageUrl! }}
            style={localStyles.heroImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}
    </>
  );
});

const localStyles = StyleSheet.create({
  heroImageContainer: {
    marginTop: Spacing.lg,
    height: HERO_IMAGE_HEIGHT,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tierBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
});
