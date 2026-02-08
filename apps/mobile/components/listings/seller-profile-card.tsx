/**
 * Seller Profile Card - Detailed seller information
 * 
 * Full profile display for partner dealers or private sellers.
 * Includes avatar, name, verification badges, rating, stats, and bio.
 */

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Linking } from 'react-native';
import { Image } from 'expo-image';
import { 
  CheckCircle2, 
  Star, 
  Clock, 
  Car,
  Globe,
  ChevronRight,
  Shield,
  BadgeCheck,
} from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

interface PartnerData {
  brandName: string | null;
  logo: string | null;
  heroImage?: string | null;
  isVerified: boolean;
  tier: string | null;
  description?: string | null;
  website?: string | null;
  city?: string | null;
  emirate?: string | null;
  badges?: string[];
  specialties?: string[];
  googleRating?: number | null;
  googleReviewCount?: number | null;
  platformRating?: number | null;
  platformReviewCount?: number | null;
}

interface UserProfile {
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl: string | null;
  isKycVerified: boolean;
  description?: string | null;
  memberSince?: Date | string | null;
  locationCity?: string | null;
  locationEmirate?: string | null;
  badges?: string[];
  tags?: string[];
  platformRating?: number | null;
  platformReviewCount?: number | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface SellerStats {
  totalListings?: number;
  soldListings?: number;
  responseRate?: number;
  responseTime?: number; // in minutes
}

interface PartnerSellerData {
  type: 'partner';
  partnerId: string;
  partner: PartnerData | null;
  staffContact?: {
    displayName?: string | null;
    phone?: string | null;
  } | null;
  stats?: SellerStats;
}

interface UserSellerData {
  type: 'user';
  userId: string;
  userProfile: UserProfile | null;
  stats?: SellerStats;
}

type SellerData = PartnerSellerData | UserSellerData;

interface SellerProfileCardProps {
  sellerData: SellerData;
  isBlk?: boolean;
  onViewProfile?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

function formatMemberSince(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getFullYear().toString();
}

// ============================================================================
// PARTNER PROFILE
// ============================================================================

function PartnerProfile({ 
  sellerData, 
  isBlk,
  onViewProfile,
}: { 
  sellerData: PartnerSellerData; 
  isBlk?: boolean;
  onViewProfile?: () => void;
}) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const partner = sellerData.partner;
  const stats = sellerData.stats;

  if (!partner) return null;

  const isBlackTier = partner.tier === 'black';
  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;
  const borderColor = isBlk ? colors.blkBorder : colors.border;
  const surfaceColor = isBlk ? colors.blkBackground : colors.surface;

  const hasRating = partner.platformRating || partner.googleRating;
  const displayRating = partner.platformRating ?? partner.googleRating ?? 0;
  const totalReviews = (partner.platformReviewCount ?? 0) + (partner.googleReviewCount ?? 0);
  const location = [partner.city, partner.emirate].filter(Boolean).join(', ');
  const badges = partner.badges ?? [];
  const specialties = partner.specialties ?? [];

  const handleWebsitePress = () => {
    if (partner.website) {
      Linking.openURL(partner.website);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      {/* Header: Avatar + Name + Verification */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSecondary }]}>
          {partner.logo ? (
            <Image
              source={{ uri: partner.logo }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarInitial, { color: secondaryTextColor }]}>
              {(partner.brandName || 'D').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {partner.brandName || 'Dealer'}
            </Text>
            {partner.isVerified && !isBlackTier && (
              <BadgeCheck size={18} color={colors.primary} />
            )}
            {isBlackTier && (
              <View style={[styles.blkBadge, { backgroundColor: colors.blkBackground }]}>
                <Text style={[styles.blkBadgeText, { color: colors.blkText }]}>BLK</Text>
              </View>
            )}
          </View>
          <Text style={[styles.sellerType, { color: secondaryTextColor }]}>
            Verified Dealer
          </Text>
        </View>
      </View>

      {/* Rating */}
      {hasRating && (
        <View style={styles.ratingRow}>
          <Star size={16} color={colors.warning} fill={colors.warning} />
          <Text style={[styles.ratingValue, { color: textColor }]}>
            {displayRating.toFixed(1)}
          </Text>
          {totalReviews > 0 && (
            <Text style={[styles.reviewCount, { color: secondaryTextColor }]}>
              ({totalReviews} reviews)
            </Text>
          )}
        </View>
      )}

      {/* Stats Row */}
      <View style={[styles.statsRow, { borderColor }]}>
        {stats?.totalListings !== undefined && (
          <View style={styles.statItem}>
            <Car size={16} color={secondaryTextColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.totalListings}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Listings
            </Text>
          </View>
        )}
        {stats?.responseTime !== undefined && (
          <View style={styles.statItem}>
            <Clock size={16} color={secondaryTextColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {formatResponseTime(stats.responseTime)}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Response
            </Text>
          </View>
        )}
        {stats?.responseRate !== undefined && (
          <View style={styles.statItem}>
            <Shield size={16} color={secondaryTextColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.responseRate}%
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Reply Rate
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {partner.description && (
        <Text 
          style={[styles.description, { color: secondaryTextColor }]}
          numberOfLines={3}
        >
          {partner.description}
        </Text>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <View style={styles.badgesRow}>
          {badges.slice(0, 3).map((badge) => (
            <View 
              key={badge} 
              style={[styles.badge, { backgroundColor: colors.accentMuted }]}
            >
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {badge}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Specialties */}
      {specialties.length > 0 && (
        <View style={styles.specialtiesRow}>
          <Text style={[styles.specialtiesLabel, { color: colors.textTertiary }]}>
            SPECIALTIES
          </Text>
          <Text 
            style={[styles.specialtiesText, { color: secondaryTextColor }]}
            numberOfLines={2}
          >
            {specialties.join(' • ')}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {partner.website && (
          <Pressable 
            onPress={handleWebsitePress}
            style={({ pressed }) => [
              styles.websiteButton, 
              { borderColor, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Globe size={16} color={textColor} />
            <Text style={[styles.websiteText, { color: textColor }]}>
              Website
            </Text>
          </Pressable>
        )}
        {onViewProfile && (
          <Pressable 
            onPress={onViewProfile}
            style={({ pressed }) => [
              styles.viewProfileButton, 
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={[styles.viewProfileText, { color: colors.primaryForeground }]}>
              View Profile
            </Text>
            <ChevronRight size={16} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// USER PROFILE
// ============================================================================

function UserProfile({ 
  sellerData, 
  isBlk,
  onViewProfile,
}: { 
  sellerData: UserSellerData; 
  isBlk?: boolean;
  onViewProfile?: () => void;
}) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const profile = sellerData.userProfile;
  const stats = sellerData.stats;

  if (!profile) return null;

  const textColor = isBlk ? colors.blkText : colors.text;
  const secondaryTextColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;
  const borderColor = isBlk ? colors.blkBorder : colors.border;
  const surfaceColor = isBlk ? colors.blkBackground : colors.surface;

  const displayName = profile.displayName ?? 
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ?? 
    'Private Seller';
  const hasRating = profile.platformRating != null;
  const memberSinceYear = profile.memberSince 
    ? formatMemberSince(profile.memberSince) 
    : null;
  const location = [profile.locationCity, profile.locationEmirate].filter(Boolean).join(', ');
  const tags = profile.tags ?? [];

  // Verification badges
  const verifications = useMemo(() => {
    const items: string[] = [];
    if (profile.isKycVerified) items.push('ID Verified');
    if (profile.emailVerified) items.push('Email');
    if (profile.phoneVerified) items.push('Phone');
    return items;
  }, [profile]);

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      {/* Header: Avatar + Name + Verification */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSecondary }]}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={[styles.avatarInitial, { color: secondaryTextColor }]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {displayName}
            </Text>
            {profile.isKycVerified && (
              <CheckCircle2 size={18} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.sellerType, { color: secondaryTextColor }]}>
            Private Seller{memberSinceYear ? ` • Member since ${memberSinceYear}` : ''}
          </Text>
        </View>
      </View>

      {/* Rating */}
      {hasRating && (
        <View style={styles.ratingRow}>
          <Star size={16} color={colors.warning} fill={colors.warning} />
          <Text style={[styles.ratingValue, { color: textColor }]}>
            {profile.platformRating!.toFixed(1)}
          </Text>
          {(profile.platformReviewCount ?? 0) > 0 && (
            <Text style={[styles.reviewCount, { color: secondaryTextColor }]}>
              ({profile.platformReviewCount} reviews)
            </Text>
          )}
        </View>
      )}

      {/* Stats Row */}
      <View style={[styles.statsRow, { borderColor }]}>
        {stats?.totalListings !== undefined && (
          <View style={styles.statItem}>
            <Car size={16} color={secondaryTextColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.totalListings}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Listings
            </Text>
          </View>
        )}
        {stats?.soldListings !== undefined && (
          <View style={styles.statItem}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {stats.soldListings}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Sold
            </Text>
          </View>
        )}
        {stats?.responseTime !== undefined && (
          <View style={styles.statItem}>
            <Clock size={16} color={secondaryTextColor} />
            <Text style={[styles.statValue, { color: textColor }]}>
              {formatResponseTime(stats.responseTime)}
            </Text>
            <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
              Response
            </Text>
          </View>
        )}
      </View>

      {/* Verification Badges */}
      {verifications.length > 0 && (
        <View style={styles.verificationsRow}>
          {verifications.map((v) => (
            <View 
              key={v} 
              style={[styles.verificationBadge, { backgroundColor: colors.successMuted }]}
            >
              <CheckCircle2 size={12} color={colors.success} />
              <Text style={[styles.verificationText, { color: colors.success }]}>
                {v}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {profile.description && (
        <Text 
          style={[styles.description, { color: secondaryTextColor }]}
          numberOfLines={3}
        >
          {profile.description}
        </Text>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.badgesRow}>
          {tags.slice(0, 3).map((tag) => (
            <View 
              key={tag} 
              style={[styles.badge, { backgroundColor: colors.fillQuaternary }]}
            >
              <Text style={[styles.badgeText, { color: secondaryTextColor }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* View Profile */}
      {onViewProfile && (
        <View style={styles.actionsRow}>
          <Pressable 
            onPress={onViewProfile}
            style={({ pressed }) => [
              styles.viewProfileButton, 
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <Text style={[styles.viewProfileText, { color: colors.primaryForeground }]}>
              View Profile
            </Text>
            <ChevronRight size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SellerProfileCard = memo(function SellerProfileCard({
  sellerData,
  isBlk = false,
  onViewProfile,
}: SellerProfileCardProps) {
  if (sellerData.type === 'partner') {
    return (
      <PartnerProfile 
        sellerData={sellerData} 
        isBlk={isBlk} 
        onViewProfile={onViewProfile}
      />
    );
  }
  
  return (
    <UserProfile 
      sellerData={sellerData} 
      isBlk={isBlk} 
      onViewProfile={onViewProfile}
    />
  );
});

// ============================================================================
// SKELETON
// ============================================================================

export function SellerProfileCardSkeleton({ isBlk = false }: { isBlk?: boolean }) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const borderColor = isBlk ? colors.blkBorder : colors.border;
  const surfaceColor = isBlk ? colors.blkBackground : colors.surface;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonCircle size={56} />
        <View style={[styles.headerText, { gap: 8 }]}>
          <Skeleton width={140} height={18} />
          <Skeleton width={100} height={14} />
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { borderColor }]}>
        <View style={styles.statItem}>
          <Skeleton width={60} height={16} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={60} height={16} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={60} height={16} />
        </View>
      </View>

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Button */}
      <Skeleton width="100%" height={44} borderRadius={Radius.full} />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    flexShrink: 1,
  },
  blkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  blkBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 0.8,
  },
  sellerType: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  specialtiesRow: {
    gap: 4,
  },
  specialtiesLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  specialtiesText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  verificationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  verificationText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  websiteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  websiteText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  viewProfileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  viewProfileText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
