/**
 * Seller Hero Section
 * 
 * Displays seller hero image, name, avatar, verification badges, and member info.
 * Follows listings component patterns for consistency.
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2, Star, Clock } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { getThumbUrl } from '@/lib/config';
import { Label, Heading, Supporting, Data, Text } from '@/components/ui';
import type { SellerHeroProps } from './types';
import { formatMemberSince } from './utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_IMAGE_HEIGHT = SCREEN_WIDTH * 0.65;
const AVATAR_SIZE = Sizes.avatarLg + Spacing.sm; // 56
const LOGO_SIZE = Sizes.avatarLg + Spacing.lg; // 64

export const SellerHero = memo(function SellerHero({ seller, colors, topInset }: SellerHeroProps) {
  // Convert to CDN URLs
  const heroImageUrl = seller.heroImage ? (getThumbUrl(seller.heroImage) || seller.heroImage) : null;
  const avatarUrl = seller.avatar ? (getThumbUrl(seller.avatar) || seller.avatar) : null;
  const hasHeroImage = heroImageUrl && seller.isDealer;
  
  return (
    <>
      {/* Hero/Cover Image - Dealers only, fills to top edge */}
      {hasHeroImage && (
        <View style={[localStyles.heroImageContainer, { marginTop: -(topInset + Spacing.lg) }]}>
          <Image
            source={{ uri: heroImageUrl! }}
            style={localStyles.heroImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

      <View style={localStyles.heroSection}>
        <View style={localStyles.heroInfo}>
          {/* Name + Badges */}
          <View style={localStyles.nameRow}>
            <Heading size="medium" numberOfLines={1} style={{ flexShrink: 1 }}>
              {seller.name}
            </Heading>
            {seller.isVerified && seller.tier?.toLowerCase() !== 'black' && (
              <CheckCircle2 size={Sizes.iconXs} color={colors.primary} />
            )}
            {seller.tier?.toLowerCase() === 'black' && (
              <View style={[localStyles.tierBadge, { backgroundColor: colors.blkBadgeBackground, borderColor: colors.blkBadgeBorder }]}>
                <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>
                  BLK
                </Label>
              </View>
            )}
          </View>
          
          {/* Seller Type */}
          <Supporting size="small">
            {seller.isDealer ? 'Verified Dealer' : 'Private Seller'}
          </Supporting>

          {/* Member Since */}
          {seller.memberSince && (
            <View style={localStyles.metaRow}>
              <Clock size={Sizes.iconXs} color={colors.iconMuted} />
              <Supporting size="mini" tone="muted">
                Member since {formatMemberSince(seller.memberSince)}
              </Supporting>
            </View>
          )}

          {/* Rating */}
          {seller.rating != null && (
            <View style={localStyles.ratingRow}>
              <Star size={Sizes.iconXs} color={colors.warning} fill={colors.warning} />
              <Data size="small">{seller.rating.toFixed(1)}</Data>
              {seller.reviewCount != null && (
                <Supporting size="small">
                  ({seller.reviewCount})
                </Supporting>
              )}
            </View>
          )}
        </View>

        {/* Avatar - Right side (squared for dealers, rounded for private) */}
        <View style={[
          seller.isDealer ? localStyles.logo : localStyles.avatar, 
          { backgroundColor: colors.surfaceSecondary }
        ]}>
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={localStyles.avatarImage} 
              contentFit="cover"
            />
          ) : (
            <Heading size="large" tone="secondary">
              {seller.name.charAt(0).toUpperCase()}
            </Heading>
          )}
        </View>
      </View>
    </>
  );
});

const localStyles = StyleSheet.create({
  heroImageContainer: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.md,
    height: HERO_IMAGE_HEIGHT,
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
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
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
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
