/**
 * Seller Hero Section
 * 
 * Displays seller hero image, name, avatar, verification badges, and member info.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Star, Clock } from 'lucide-react-native';

import { Spacing } from '@/constants/theme';
import type { SellerHeroProps } from './types';
import { formatMemberSince } from './utils';
import { styles } from './styles';

export const SellerHero = memo(function SellerHero({ seller, colors, topInset }: SellerHeroProps) {
  const hasHeroImage = seller.heroImage && seller.isDealer;
  
  return (
    <>
      {/* Hero/Cover Image - Dealers only, fills to top edge */}
      {hasHeroImage && (
        <View style={[styles.heroImageContainer, { marginTop: -(topInset + Spacing.lg) }]}>
          <Image
            source={{ uri: seller.heroImage! }}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

      <View style={styles.heroSection}>
        <View style={styles.heroInfo}>
          {/* Name + Badge */}
          <View style={styles.nameRow}>
            <Text style={[styles.sellerName, { color: colors.text }]} numberOfLines={1}>
              {seller.name}
            </Text>
            {seller.isVerified && (
              <CheckCircle2 size={18} color={colors.primary} />
            )}
            {seller.tier?.toLowerCase() === 'blk' && (
              <View style={[styles.tierPill, { backgroundColor: colors.blkBackground }]}>
                <Text style={[styles.tierText, { color: colors.blkText }]}>BLK</Text>
              </View>
            )}
          </View>
          
          {/* Seller Type */}
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {seller.isDealer ? 'Verified Dealer' : 'Private Seller'}
          </Text>

          {/* Member Since */}
          {seller.memberSince && (
            <View style={styles.memberRow}>
              <Clock size={13} color={colors.textTertiary} />
              <Text style={[styles.memberText, { color: colors.textTertiary }]}>
                Member since {formatMemberSince(seller.memberSince)}
              </Text>
            </View>
          )}

          {/* Rating - inline */}
          {seller.rating && (
            <View style={styles.ratingRow}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.ratingValue, { color: colors.text }]}>{seller.rating.toFixed(1)}</Text>
              {seller.reviewCount && (
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                  ({seller.reviewCount})
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Avatar - Right side (squared for dealers, rounded for private) */}
        <View style={[
          seller.isDealer ? styles.logoContainer : styles.avatarLarge, 
          { backgroundColor: colors.surfaceSecondary }
        ]}>
          {seller.avatar ? (
            <Image 
              source={{ uri: seller.avatar }} 
              style={styles.avatarImg} 
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarInitial, { color: colors.textSecondary }]}>
              {seller.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>
    </>
  );
});
