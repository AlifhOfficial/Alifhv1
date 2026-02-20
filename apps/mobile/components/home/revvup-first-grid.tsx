/**
 * Revvup First Grid - Founding Partners Showcase
 * Horizontal scrolling partner cards with clean design
 * Light theme to complement the dark BLK grid
 * 
 * Now supports:
 * - API-driven data through props (PartnerListItem from partner-api)
 * - Loading states
 * - Empty state handling
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Heading, Supporting, Skeleton, SkeletonCircle, BrandAvatar } from '@/components/ui';
import { type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// FOUNDING PARTNERS SKELETON
// ============================================================================

const FoundingPartnersSkeleton = memo(function FoundingPartnersSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.partnerItem}>
          <SkeletonCircle size={Sizes.avatarLg} />
          <Skeleton width="80%" height={12} style={{ marginTop: Spacing.sm }} />
        </View>
      ))}
    </ScrollView>
  );
});

// ============================================================================
// TYPES
// ============================================================================

/** Partner display data for founding partners grid */
export interface FoundingPartnerItem {
  id: string;
  name: string;
  logo?: ImageSourcePropType | string | null;
}

/** Convert PartnerListItem from API to display format */
export function partnerToFoundingItem(partner: PartnerListItem): FoundingPartnerItem {
  return {
    id: partner.id,
    name: partner.brandName,
    logo: partner.logoUrl || partner.logo,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PARTNER CARD
// ============================================================================

interface PartnerCardProps {
  partner: FoundingPartnerItem;
  onPress?: (partnerId: string) => void;
}

const PartnerCard = memo(function PartnerCard({
  partner,
  onPress,
}: PartnerCardProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    onPress?.(partner.id);
  }, [partner.id, onPress]);

  // Get logo as string URL
  const logoUrl = typeof partner.logo === 'string' ? partner.logo : null;

  return (
    <HapticPressable onPress={handlePress} style={styles.partnerItem}>
      {/* Circular Avatar */}
      <View style={styles.avatarWrapper}>
        <BrandAvatar
          src={logoUrl}
          name={partner.name}
          size="lg"
          shape="round"
          glass
        />
      </View>

      {/* Partner Name */}
      <Supporting size="small" style={[styles.partnerName, { color: colors.text }]}>
        {partner.name}
      </Supporting>
    </HapticPressable>
  );
});

// ============================================================================
// REVVUP FIRST GRID COMPONENT
// ============================================================================

interface RevvupFirstGridProps {
  /** Founding partners to display - from API */
  partners?: FoundingPartnerItem[];
  /** Loading state */
  isLoading?: boolean;
  onBrowseAllPress?: () => void;
  onPartnerPress?: (partnerId: string) => void;
}

export const RevvupFirstGrid = memo(function RevvupFirstGrid({
  partners = [],
  isLoading = false,
  onBrowseAllPress,
  onPartnerPress,
}: RevvupFirstGridProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleBrowseAllPress = useCallback(() => {
    onBrowseAllPress?.();
    // Navigate to partners list
  }, [onBrowseAllPress]);

  const handlePartnerPress = useCallback((partnerId: string) => {
    onPartnerPress?.(partnerId);
    router.push(`/seller-contact/${partnerId}` as any);
  }, [onPartnerPress, router]);

  // Don't render if no partners and not loading
  if (!isLoading && partners.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Heading size="medium" style={{ color: colors.text }}>Revvup first</Heading>
        </View>
      </View>

      {/* Founding Partners Tagline */}
      <View style={styles.taglineRow}>
        <Supporting size="medium" style={[styles.taglineText, { color: colors.textTertiary }]}>Founding Partners</Supporting>
      </View>

      {/* Horizontal Scrolling Partner Cards */}
      {isLoading ? (
        <FoundingPartnersSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {partners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onPress={handlePartnerPress}
            />
          ))}
        </ScrollView>
      )}

      {/* Browse All Footer */}
      <HapticPressable onPress={handleBrowseAllPress} style={styles.footer}>
        <Heading size="small" style={[styles.browseAllText, { color: colors.text }]}>
          Browse all
        </Heading>
        <View style={[styles.arrowCircle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
          <ArrowRight size={Sizes.iconSm} color={colors.icon} strokeWidth={2.5} />
        </View>
      </HapticPressable>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    paddingBottom: Spacing['2xl'],
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  taglineRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  taglineText: {
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    gap: Spacing['3xl'],
  },
  partnerItem: {
    alignItems: 'center',
    minWidth: Sizes.avatarLg,
  },
  avatarWrapper: {
    marginBottom: Spacing.sm,
  },
  partnerName: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  browseAllText: {
  },
  arrowCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
