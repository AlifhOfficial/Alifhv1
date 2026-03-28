/**
 * Revvup First Grid - Founding Partners Showcase
 * Premium horizontal scroll of partner avatars
 * Follows blk-grid-card patterns
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { HapticPressable, Heading, Skeleton, BrandAvatar, Supporting } from '@/components/ui';
import { type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// TYPES
// ============================================================================

export interface FoundingPartnerItem {
  id: string;
  name: string;
  logo?: ImageSourcePropType | string | null;
  heroImage?: string | null;
}

export function partnerToFoundingItem(partner: PartnerListItem): FoundingPartnerItem {
  return {
    id: partner.id,
    name: partner.brandName,
    logo: partner.logoUrl || partner.logo,
    heroImage: partner.heroImageUrl || partner.heroImage,
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PARTNER_CARD_WIDTH = 160;
const PARTNER_CARD_HEIGHT = 180;

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
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i} 
          width={PARTNER_CARD_WIDTH} 
          height={PARTNER_CARD_HEIGHT} 
          borderRadius={Radius.xl} 
        />
      ))}
    </ScrollView>
  );
});

// ============================================================================
// PARTNER ITEM
// ============================================================================

interface PartnerItemProps {
  partner: FoundingPartnerItem;
  colors: typeof Colors.light;
  onPress?: (partnerId: string, partnerName: string) => void;
}

const PartnerItem = memo(function PartnerItem({
  partner,
  colors,
  onPress,
}: PartnerItemProps) {
  const handlePress = useCallback(() => {
    onPress?.(partner.id, partner.name);
  }, [partner.id, partner.name, onPress]);

  const logoUrl = typeof partner.logo === 'string' ? partner.logo : null;
  const heroUrl = partner.heroImage || logoUrl;

  return (
    <HapticPressable onPress={handlePress} style={[styles.partnerCard, { backgroundColor: colors.surface }]}>
      {/* Blurred Banner Background */}
      {heroUrl && (
        <Image
          source={{ uri: heroUrl }}
          style={styles.blurredBackground}
          blurRadius={20}
          contentFit="cover"
        />
      )}
      
      {/* Content overlay */}
      <View style={styles.cardContent}>
        {/* Logo - Top centered */}
        <View style={styles.logoContainer}>
          <BrandAvatar
            src={logoUrl}
            name={partner.name}
            size="xl"
            shape="round"
            backgroundColor={colors.bg}
          />
        </View>
        
        {/* Partner Name - Bottom, wraps to multiple lines */}
        <View style={styles.partnerTextContainer}>
          <Heading size="subheading" style={{ color: colors.text, textAlign: 'center' }}>
            {partner.name}
          </Heading>
        </View>
      </View>
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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
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

  const cardBg = colors.blkBg;
  const textColor = colors.blkText;
  const textSecondary = colors.blkText2;

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.blkBadgeBg,
              borderColor: colors.blkBadgeBorder,
              borderWidth: 1,
            },
          ]}
        >
          <Image
            source={require('@/assets/images/revv.png')}
            style={{ width: Spacing.xl, height: Spacing.xl, tintColor: colors.blkBadgeFg }}
            contentFit="contain"
          />
        </View>
        <View style={styles.headerText}>
          <Heading size="subheading" style={{ color: textColor }}>Founding Partners</Heading>
          <Supporting size="bodySm" style={{ color: textSecondary }}>Our Trusted Dealers</Supporting>
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
        >
          {partners.map((partner) => (
            <PartnerItem
              key={partner.id}
              partner={partner}
              colors={colors}
              onPress={handlePartnerPress}
            />
          ))}
        </ScrollView>
      )}

      {/* Footer */}
      <HapticPressable onPress={handleBrowseAllPress} style={styles.footer}>
        <Heading size="subheading" style={{ color: textColor }}>See all partners</Heading>
        <View
          style={[
            styles.arrowBtn,
            {
              backgroundColor: colors.blkBadgeBg,
              borderColor: colors.blkBadgeBorder,
              borderWidth: 1,
            },
          ]}
        >
          <ChevronRight size={Sizes.iconSm} color={colors.blkBadgeFg} strokeWidth={2} />
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
  },
  headerText: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  partnerCard: {
    width: PARTNER_CARD_WIDTH,
    height: PARTNER_CARD_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  blurredBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerTextContainer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  arrowBtn: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
