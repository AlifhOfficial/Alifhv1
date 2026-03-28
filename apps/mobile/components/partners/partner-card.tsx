/**
 * Partner Card - Revvup Design System
 * Mobile-optimized partner/dealer card following car-card-m patterns
 * Showcases partner info with hero image, logo, stats
 */

import React, { useCallback, memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Star, Car, CheckCircle2, Calendar } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { getAppThumbUrl } from '@/lib/config';
import { 
  HapticPressable,
  Skeleton, 
  SkeletonCircle,
  Heading,
  Data,
  Label,
  Supporting,
  BrandAvatar,
} from '@/components/ui';
import type { PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// CONSTANTS
// ============================================================================

const IMAGE_ASPECT_RATIO = 21 / 9;
const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Emirate display mapping
const EMIRATE_MAP: Record<string, string> = {
  'dubai': 'Dubai',
  'abu_dhabi': 'Abu Dhabi',
  'sharjah': 'Sharjah',
  'ajman': 'Ajman',
  'ras_al_khaimah': 'RAK',
  'fujairah': 'Fujairah',
  'umm_al_quwain': 'UAQ',
};

function formatEmirate(emirate: string): string {
  return EMIRATE_MAP[emirate.toLowerCase()] || emirate;
}

// ============================================================================
// TYPES
// ============================================================================

export interface PartnerCardProps {
  partner: PartnerListItem;
  onPress?: (partnerId: string, partnerName: string) => void;
}

// ============================================================================
// CARD THEME (following car-card-m patterns)
// ============================================================================

interface CardTheme {
  bg: string;
  border: string;
  title: string;
  meta: string;
  stats: string;
  imageBg: string;
}

function useCardTheme(colors: typeof Colors.light, isBlkPartner: boolean): CardTheme {
  return useMemo(() => {
    if (isBlkPartner) {
      return {
        bg: colors.blkBg,
        border: colors.blkBorder,
        title: colors.blkText,
        meta: colors.blkText2,
        stats: colors.blkText2,
        imageBg: colors.blkBg,
      };
    }
    return {
      bg: colors.surface,
      border: colors.border,
      title: colors.text,
      meta: colors.text2,
      stats: colors.text2,
      imageBg: colors.surface2,
    };
  }, [colors, isBlkPartner]);
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PartnerCard = memo(function PartnerCard({
  partner,
  onPress,
}: PartnerCardProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const isBlkPartner = partner.tier === 'black';
  const theme = useCardTheme(colors, isBlkPartner);

  // Derived display values
  const logoUrl = partner.logoUrl || partner.logo;
  const rawHeroUrl = partner.heroImageUrl || partner.heroImage;
  const heroUrl = getAppThumbUrl(rawHeroUrl);
  const location = [partner.city, partner.emirate ? formatEmirate(partner.emirate) : null]
    .filter(Boolean)
    .join(', ');

  // Handlers
  const handlePress = useCallback(() => {
    onPress?.(partner.id, partner.brandName);
  }, [partner.id, partner.brandName, onPress]);

  return (
    <HapticPressable
      onPress={handlePress}
      style={[styles.container, { borderColor: theme.border, backgroundColor: theme.bg }]}
    >
      {/* BLK Accent Line */}
      {isBlkPartner && <View style={[styles.blkAccent, { backgroundColor: theme.border }]} />}

      {/* === HERO IMAGE SECTION === */}
      <View style={styles.imageContainer}>
        {heroUrl ? (
          <Image
            source={{ uri: heroUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: IMAGE_BLURHASH }}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.imageBg }]}>
            <Supporting size="bodySm" style={{ color: colors.text3 }}>No Image</Supporting>
          </View>
        )}
        
        {/* Logo overlay in bottom-left */}
        <View style={styles.logoOverlay}>
          <BrandAvatar
            src={logoUrl}
            name={partner.brandName}
            size="md"
            shape="round"
            glass
          />
        </View>
      </View>

      {/* === CONTENT SECTION === */}
      <View style={styles.content}>
        {/* Header: Name + Verified/BLK Badge */}
        <View style={styles.header}>
          <Heading size="subheading" style={{ color: theme.title }} numberOfLines={1}>
            {partner.brandName}
          </Heading>
          {/* BLK partners get BLK badge, regular verified partners get checkmark */}
          {isBlkPartner ? (
            <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBg, borderColor: colors.blkBadgeBorder }]}>
              <Label size="caption" uppercase={false} style={{ color: colors.blkBadgeFg }}>BLK</Label>
            </View>
          ) : partner.isVerified && (
            <CheckCircle2 size={Sizes.iconSm} color={colors.primary} />
          )}
        </View>

        {/* Location */}
        {location && (
          <View style={styles.row}>
            <MapPin size={Sizes.iconXs} color={theme.meta} />
            <Data size="bodySm" style={{ color: theme.meta }}>{location}</Data>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Listings Count */}
          {partner.activeListingsCount > 0 && (
            <View style={styles.statItem}>
              <Car size={Sizes.iconXs} color={theme.stats} />
              <Data size="bodySm" style={{ color: theme.stats }}>
                {partner.activeListingsCount} cars
              </Data>
            </View>
          )}

          {/* Google Rating */}
          {partner.googleRating && (
            <View style={styles.statItem}>
              <Star size={Sizes.iconXs} color="#FBBF24" fill="#FBBF24" />
              <Data size="bodySm" style={{ color: theme.stats }}>
                {partner.googleRating.toFixed(1)}
                {partner.googleReviewCount && (
                  <Data size="bodySm" style={{ color: theme.meta }}>
                    {' '}({partner.googleReviewCount})
                  </Data>
                )}
              </Data>
            </View>
          )}

          {/* Experience Years */}
          {partner.experienceYears && partner.experienceYears > 0 && (
            <View style={styles.statItem}>
              <Calendar size={Sizes.iconXs} color={theme.stats} />
              <Data size="bodySm" style={{ color: theme.stats }}>
                {partner.experienceYears}+ yrs
              </Data>
            </View>
          )}
        </View>

        {/* Specialties */}
        {partner.specialties && partner.specialties.length > 0 && (
          <View style={styles.specialtiesRow}>
            {partner.specialties.slice(0, 3).map((specialty, idx) => (
              <View 
                key={specialty} 
                style={[styles.specialtyChip, { backgroundColor: isBlkPartner ? colors.blkBg : colors.fill2, borderColor: theme.border }]}
              >
                <Label size="caption" style={{ color: theme.stats }}>{specialty}</Label>
              </View>
            ))}
            {partner.specialties.length > 3 && (
              <Data size="bodySm" style={{ color: theme.meta }}>
                +{partner.specialties.length - 3}
              </Data>
            )}
          </View>
        )}
      </View>
    </HapticPressable>
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function PartnerCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface2 }]} />
        <View style={styles.logoOverlay}>
          <SkeletonCircle size={Sizes.avatarMd} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Skeleton width="60%" height={18} />
        </View>
        <Skeleton width="40%" height={14} style={{ marginTop: Spacing.xs }} />
        <View style={[styles.statsRow, { marginTop: Spacing.sm }]}>
          <Skeleton width="25%" height={14} />
          <Skeleton width="20%" height={14} />
          <Skeleton width="20%" height={14} />
        </View>
        <View style={[styles.specialtiesRow, { marginTop: Spacing.sm }]}>
          <Skeleton width={60} height={22} borderRadius={Radius.full} />
          <Skeleton width={70} height={22} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Layout
  container: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    flexDirection: 'column',
  },

  // Image Section
  imageContainer: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: -Sizes.avatarMd / 2,
    left: Spacing.lg,
  },
  tierBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  tierBadgeText: {
    color: '#FAFAFA',
  },

  // Content Section
  content: {
    padding: Spacing.lg,
    paddingTop: Sizes.avatarMd / 2 + Spacing.md,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  specialtiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
  },

  // BLK Styling
  blkAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 1,
  },
  blkBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.none,
    borderWidth: 1,
  },
});
