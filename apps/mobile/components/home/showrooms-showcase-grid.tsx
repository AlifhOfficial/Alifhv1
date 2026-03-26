/**
 * Showrooms Showcase Grid
 * Single image background with brand name overlay
 * Displays real showroom data from API
 * 
 * Follows Revvup Design System patterns:
 * - Uses theme tokens only (no hardcoded colors)
 * - Matches BLK/Partner grid styling
 * - Glass CTA button with ChevronRight
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { HapticPressable, Heading, Supporting, Skeleton } from '@/components/ui';
import { type ShowroomCardData } from '@/lib/showroom-api';

// ============================================================================
// CONSTANTS
// ============================================================================

// Aspect ratio for showroom card (3:4 - tall portrait, cinematic feel)
const CARD_ASPECT = 3 / 4;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ============================================================================
// SHOWROOMS SHOWCASE GRID
// ============================================================================

interface ShowroomsShowcaseGridProps {
  /** Showroom data from API */
  showroom?: ShowroomCardData | null;
  /** Loading state */
  isLoading?: boolean;
  /** Callback when card is pressed */
  onPress?: () => void;
}

export const ShowroomsShowcaseGrid = memo(function ShowroomsShowcaseGrid({
  showroom,
  isLoading,
  onPress,
}: ShowroomsShowcaseGridProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { applySearch, clearSearch, clearFilterParams, resetSort } = useSearch();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }
    // Navigate to browse with partner filter
    if (showroom?.partnerId) {
      clearSearch();
      clearFilterParams();
      resetSort();
      applySearch({ partnerId: showroom.partnerId, partnerName: showroom.partner.brandName });
      router.push('/browse' as any);
    }
  }, [onPress, showroom, applySearch, clearSearch, clearFilterParams, resetSort, router]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.skeletonContainer]}>
        <Skeleton 
          width="100%" 
          height={200} 
          borderRadius={Radius['2xl']} 
          style={styles.skeletonFill}
        />
      </View>
    );
  }

  // No data state
  if (!showroom) {
    return null;
  }

  const imageSource = showroom.heroImageUrl || showroom.partner.heroImageUrl;
  const cardBg = colors.surface;

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={styles.mediaBg}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH }}
          transition={150}
        />
      ) : (
        <View style={[styles.mediaBg, { backgroundColor: colors.surface }]} />
      )}

      {/* Gradient overlay for text readability */}
      <LinearGradient
        colors={['transparent', colors.overlay]}
        locations={[0.4, 1]}
        style={styles.gradient}
      />

      {/* Content - Bottom aligned */}
      <View style={styles.content}>
        {/* Footer CTA */}
        <HapticPressable onPress={handlePress} style={styles.footer}>
          <View style={styles.footerText}>
            <Heading size="small" style={{ color: colors.white }}>
              {showroom.partner.brandName}
            </Heading>
            <Supporting size="small" style={{ color: colors.text3 }}>
              {showroom.heroTagline || 'Visit showroom'}
            </Supporting>
          </View>
          {/* Always use dark glass style since button is over video */}
          <View style={[styles.arrowBtn, { backgroundColor: Colors.dark.glassBg, borderColor: colors.glassBorderDark }]}>
            <ChevronRight size={Sizes.iconSm} color={colors.white} strokeWidth={2} />
          </View>
        </HapticPressable>
      </View>
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
    aspectRatio: CARD_ASPECT,
  },
  skeletonContainer: {
    borderWidth: 0,
  },
  skeletonFill: {
    flex: 1,
  },
  mediaBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  arrowBtn: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

