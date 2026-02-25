/**
 * Revvup First Grid - Founding Partners Showcase
 * Premium horizontal scroll of partner avatars with dark luxury aesthetic
 * Follows blk-grid-card and partner-grid patterns
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { HapticPressable, Heading, Supporting, Skeleton, SkeletonCircle, BrandAvatar } from '@/components/ui';
import { RevvupLogo } from '@/components/ui/loaders';
import { type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// TYPES
// ============================================================================

export interface FoundingPartnerItem {
  id: string;
  name: string;
  logo?: ImageSourcePropType | string | null;
}

export function partnerToFoundingItem(partner: PartnerListItem): FoundingPartnerItem {
  return {
    id: partner.id,
    name: partner.brandName,
    logo: partner.logoUrl || partner.logo,
  };
}

// ============================================================================
// SKELETON
// ============================================================================

const FoundingPartnersSkeleton = memo(function FoundingPartnersSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.partnerItem}>
          <SkeletonCircle size={Sizes.avatarLg} />
          <Skeleton width={50} height={12} style={styles.nameSkeleton} />
        </View>
      ))}
    </ScrollView>
  );
});

// ============================================================================
// PARTNER ITEM
// ============================================================================

interface PartnerItemProps {
  partner: FoundingPartnerItem;
  onPress?: (partnerId: string, partnerName: string) => void;
}

const PartnerItem = memo(function PartnerItem({
  partner,
  onPress,
}: PartnerItemProps) {
  const { colors } = useTheme();
  const handlePress = useCallback(() => {
    onPress?.(partner.id, partner.name);
  }, [partner.id, partner.name, onPress]);

  const logoUrl = typeof partner.logo === 'string' ? partner.logo : null;

  return (
    <HapticPressable onPress={handlePress} style={styles.partnerItem}>
      <BrandAvatar
        src={logoUrl}
        name={partner.name}
        size="lg"
        shape="round"
        backgroundColor={colors.surface}
      />
      <Supporting size="small" style={[styles.partnerName, { color: colors.textTertiary }]} numberOfLines={1}>
        {partner.name}
      </Supporting>
    </HapticPressable>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RevvupFirstGridProps {
  partners?: FoundingPartnerItem[];
  isLoading?: boolean;
  onBrowseAllPress?: () => void;
  onPartnerPress?: (partnerId: string, partnerName: string) => void;
}

export const RevvupFirstGrid = memo(function RevvupFirstGrid({
  partners = [],
  isLoading = false,
  onBrowseAllPress,
  onPartnerPress,
}: RevvupFirstGridProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams, resetSort } = useSearch();

  const handleBrowseAllPress = useCallback(() => {
    onBrowseAllPress?.();
    router.push('/partners' as any);
  }, [onBrowseAllPress, router]);

  const handlePartnerPress = useCallback((partnerId: string, partnerName: string) => {
    onPartnerPress?.(partnerId, partnerName);
    clearSearch();
    clearFilterParams();
    resetSort();
    applySearch({ partnerId, partnerName });
    router.push('/browse' as any);
  }, [onPartnerPress, applySearch, clearSearch, clearFilterParams, resetSort, router]);

  if (!isLoading && partners.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
      {/* Header with Revvup Logo */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.oledBlack }]}>
          <RevvupLogo size={20} color={colors.oledWhite} />
        </View>
        <View style={styles.headerInfo}>
          <Heading size="mini" style={{ color: colors.text }}>Founding Partners</Heading>
          <Supporting size="small" style={{ color: colors.textTertiary }}>Our Trusted Dealers</Supporting>
        </View>
      </View>

      {/* Partners Scroll */}
      {isLoading ? (
        <FoundingPartnersSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.partnersScroll}
        >
          {partners.map((partner) => (
            <PartnerItem
              key={partner.id}
              partner={partner}
              onPress={handlePartnerPress}
            />
          ))}
        </ScrollView>
      )}

      {/* Footer */}
      <HapticPressable onPress={handleBrowseAllPress} style={styles.footer}>
        <Heading size="mini" style={[styles.footerText, { color: colors.text }]}>Browse all</Heading>
        <View style={[styles.arrowCircle, { backgroundColor: colors.fill }]}>
          <ChevronRight size={Sizes.iconSm} color={colors.icon} strokeWidth={2} />
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
    marginHorizontal: Layout.screenPadding,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  avatar: {
    width: Sizes.avatarMd,
    height: Sizes.avatarMd,
    borderRadius: Sizes.avatarMd / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerInfo: {
    flex: 1,
  },
  partnersScroll: {
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  partnerItem: {
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: Sizes.avatarLg,
  },
  partnerName: {
    textAlign: 'center',
  },
  nameSkeleton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  footerText: {
  },
  arrowCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
