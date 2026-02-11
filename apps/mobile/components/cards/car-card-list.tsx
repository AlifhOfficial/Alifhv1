/**
 * Car Card List View - Revvup Design System
 * Clean, minimal horizontal list item
 */

import React, { useCallback, memo } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Image } from 'expo-image';
import { Heart, Share2, Sparkles } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useListingFavorite } from '@/context/favorites-context';
import { useAuth } from '@/context/auth-context';
import { playFavChime, playSuperlikeChime } from '@/lib/chime';
import { Skeleton, Data, Label, ConfettiBurst, useConfettiBurst, FAVORITE_COLORS, SUPERLIKE_COLORS } from '@/components/ui';

// ============================================================================
// UTILITIES
// ============================================================================

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMileage(km: number): string {
  return km >= 1000 ? `${(km / 1000).toFixed(0)}k km` : `${km} km`;
}

const EMIRATE_SHORT: Record<string, string> = {
  'dubai': 'DXB',
  'abu_dhabi': 'AUH',
  'abu dhabi': 'AUH',
  'abudhabi': 'AUH',
  'sharjah': 'SHJ',
  'ajman': 'AJM',
  'ras_al_khaimah': 'RAK',
  'ras al khaimah': 'RAK',
  'ras al-khaimah': 'RAK',
  'rasalkhaimah': 'RAK',
  'fujairah': 'FUJ',
  'umm_al_quwain': 'UAQ',
  'umm al quwain': 'UAQ',
  'umm al-quwain': 'UAQ',
  'ummalquwain': 'UAQ',
};

const SPECS_SHORT: Record<string, string> = {
  'gcc': 'GCC',
  'us': 'US',
  'european': 'EU',
  'japanese': 'JP',
  'canadian': 'CA',
  'american': 'US',
};

// ============================================================================
// TYPES
// ============================================================================

export interface CarCardListProps {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string | null;
  price: number;
  mileage: number;
  emirate: string;
  specs?: string | null;
  thumbnail?: string | null;
  images?: string[];
  isBlkListing?: boolean;
  partnerName?: string | null;
  partnerLogo?: string | null;
  partnerVerified?: boolean;
  isBlackTierPartner?: boolean;
  sellerName?: string | null;
  sellerAvatarUrl?: string | null;
  kycVerified?: boolean;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  onPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const IMAGE_WIDTH = 160;
const IMAGE_HEIGHT = 140;

export const CarCardList = memo(function CarCardList({
  id,
  make,
  model,
  year,
  price,
  mileage,
  emirate,
  specs = 'GCC',
  thumbnail,
  images,
  isBlkListing = false,
  isFavorite: isFavoriteProp,
  isSuperliked: isSuperlikedProp,
  onPress,
  onFavoritePress,
  onSuperlikePress,
  onSharePress,
}: CarCardListProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { openAuthFlow, isAuthenticated } = useAuth();
  
  // Use context for favorites state (with prop overrides for flexibility)
  const favoriteState = useListingFavorite(id);
  const isFavorite = isFavoriteProp ?? favoriteState.isFavorite;
  const isSuperliked = isSuperlikedProp ?? favoriteState.isSuperliked;

  // Confetti effects
  const favConfetti = useConfettiBurst();
  const superConfetti = useConfettiBurst();

  const displayImage = thumbnail || images?.[0];
  const displayEmirate = emirate ? (EMIRATE_SHORT[emirate.toLowerCase()] || emirate) : '';
  const displaySpecs = specs ? (SPECS_SHORT[specs.toLowerCase()] || specs) : 'GCC';
  
  // Colors
  const cardBg = isBlkListing ? colors.blkBackground : colors.surface;
  const cardBorder = isBlkListing ? colors.blkBorder : colors.border;
  const textColor = isBlkListing ? colors.blkText : colors.text;
  const priceColor = isBlkListing ? colors.blkText : colors.primary;
  const metaColor = isBlkListing ? colors.blkTextSecondary : colors.textSecondary;
  const iconColor = isBlkListing ? colors.blkTextSecondary : colors.icon;

  const handlePress = useCallback(() => onPress?.(id), [id, onPress]);
  const handleFavoritePress = useCallback(() => {
    if (onFavoritePress) {
      onFavoritePress(id);
    } else {
      if (!isAuthenticated) {
        openAuthFlow();
        return;
      }
      favoriteState.toggleFavorite().catch((err) => {
        if (err?.message === 'AUTH_REQUIRED') {
          openAuthFlow();
        }
      });
    }
    // Fire confetti + chime when toggling ON
    if (!isFavorite) {
      favConfetti.fire({ colors: FAVORITE_COLORS, count: 8 });
      playFavChime();
    }
  }, [id, onFavoritePress, favoriteState, isAuthenticated, openAuthFlow, isFavorite, favConfetti]);
  
  const handleSuperlikePress = useCallback(() => {
    if (onSuperlikePress) {
      onSuperlikePress(id);
      return;
    }
    
    if (!isAuthenticated) {
      openAuthFlow();
      return;
    }
    
    // If already superliked, just toggle off
    if (isSuperliked) {
      favoriteState.toggleSuperlike().catch((err) => {
        if (err?.message === 'AUTH_REQUIRED') {
          openAuthFlow();
        }
      });
      return;
    }
    
    // Check quota before showing confirmation
    const quota = favoriteState.quota;
    const remaining = quota?.remaining ?? 0;
    const total = (quota?.maxSuperlikesPerMonth ?? 0) + (quota?.premiumSuperlikesBonus ?? 0);
    
    if (remaining <= 0) {
      const resetDate = quota?.periodEndDate 
        ? new Date(quota.periodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;
      Alert.alert(
        'No Superlikes Left',
        `You've used all your superlikes for this month.${resetDate ? ` They'll reset on ${resetDate}.` : ''}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Show confirmation
    Alert.alert(
      'Superlike this listing?',
      `You have ${remaining}/${total} superlikes remaining this month.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            superConfetti.fire({ colors: SUPERLIKE_COLORS, count: 10 });
            playSuperlikeChime();
            favoriteState.toggleSuperlike().catch((err) => {
              if (err?.message === 'AUTH_REQUIRED') {
                openAuthFlow();
              } else if (err?.message === 'QUOTA_EXCEEDED') {
                Alert.alert('No Superlikes Left', 'You\'ve used all your superlikes for this month.');
              }
            });
          }
        },
      ]
    );
  }, [id, onSuperlikePress, favoriteState, isAuthenticated, openAuthFlow, isSuperliked, superConfetti]);
  
  const handleSharePress = useCallback(() => onSharePress?.(id), [id, onSharePress]);

  return (
    <HapticPressable
      onPress={handlePress}
      style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}
    >
      {/* Image */}
      <View style={[styles.imageContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.skeleton }]} />
        )}
        {isBlkListing && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>
              BLK
            </Label>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Data size="small" style={{ color: textColor, fontWeight: '600' }} numberOfLines={1}>
          {make} {model}
        </Data>

        {/* Year */}
        <Data size="mini" style={{ color: metaColor }}>
          {year}
        </Data>

        {/* Row 3: Price */}
        <Data size="medium" style={{ color: priceColor, fontWeight: '700' }}>
          {formatPrice(price)}
        </Data>

        {/* Row 4: Meta */}
        <Data size="mini" style={{ color: metaColor }}>
          {formatMileage(mileage)} · {displaySpecs} · {displayEmirate}
        </Data>
      </View>

      {/* Vertical Actions */}
      <View style={styles.actionsVertical}>
        <HapticPressable onPress={handleSharePress} hitSlop={8}>
          <Share2 size={18} color={iconColor} strokeWidth={1.75} />
        </HapticPressable>
        <View style={styles.actionWrapper}>
          <HapticPressable onPress={handleFavoritePress} hitSlop={8}>
            <Heart
              size={18}
              color={isFavorite ? colors.favorite : iconColor}
              fill={isFavorite ? colors.favorite : 'none'}
              strokeWidth={1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={favConfetti.ref} />
        </View>
        <View style={styles.actionWrapper}>
          <HapticPressable onPress={handleSuperlikePress} hitSlop={8}>
            <Sparkles
              size={18}
              color={isSuperliked ? colors.warning : iconColor}
              fill={isSuperliked ? colors.warning : 'none'}
              strokeWidth={1.75}
            />
          </HapticPressable>
          <ConfettiBurst ref={superConfetti.ref} />
        </View>
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function CarCardListSkeleton() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={IMAGE_WIDTH} height={IMAGE_HEIGHT} borderRadius={Radius.md} />
      <View style={styles.content}>
        <Skeleton width={130} height={14} />
        <Skeleton width={90} height={15} />
        <Skeleton width={110} height={12} />
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  actionsVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  actionWrapper: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blkBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
});
