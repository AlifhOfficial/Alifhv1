/**
 * Showrooms Showcase Grid
 * Single video background with brand name overlay
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackSource } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';
import { HapticPressable, Heading, Supporting } from '@/components/ui';

// ============================================================================
// LOCAL VIDEO ASSETS
// ============================================================================

const SHOWROOM_VIDEOS = {
  hero2: require('@/assets/Videos/hero2.mp4'),
  revvuphero2: require('@/assets/Videos/revvuphero2.mp4'),
  rs7350: require('@/assets/Videos/rs7350.mp4'),
};

interface ShowroomVideoData {
  id: string;
  name: string;
  video: AVPlaybackSource;
}

const SHOWROOM_DATA: ShowroomVideoData[] = [
  { id: 'sr-1', name: 'Al Quoz Luxury Motors', video: SHOWROOM_VIDEOS.hero2 },
  { id: 'sr-2', name: 'Emirates Prestige', video: SHOWROOM_VIDEOS.revvuphero2 },
  { id: 'sr-3', name: 'Capital Motors', video: SHOWROOM_VIDEOS.rs7350 },
];

// ============================================================================
// SHOWROOMS SHOWCASE GRID
// ============================================================================

interface ShowroomsShowcaseGridProps {
  onViewAllPress?: () => void;
  limit?: number;
  offset?: number;
  /** Partner ID to filter by when navigating */
  partnerId?: string;
  /** Partner name for display in browse */
  partnerName?: string;
}

export const ShowroomsShowcaseGrid = memo(function ShowroomsShowcaseGrid({
  onViewAllPress,
  limit,
  offset = 0,
  partnerId,
  partnerName,
}: ShowroomsShowcaseGridProps) {
  const { colors } = useTheme();
  const { applySearch, clearSearch, clearFilterParams, resetSort } = useSearch();
  const router = useRouter();
  const start = offset % SHOWROOM_DATA.length;
  const displayShowrooms = limit ? SHOWROOM_DATA.slice(start, start + limit) : SHOWROOM_DATA;
  // Use first showroom's video as background
  const backgroundVideo = displayShowrooms[0]?.video;

  const handleViewAllPress = useCallback(() => {
    onViewAllPress?.();
    if (partnerId) {
      clearSearch();
      clearFilterParams();
      resetSort();
      applySearch({ partnerId, partnerName: partnerName || displayShowrooms[0]?.name });
      router.push('/browse' as any);
    }
  }, [onViewAllPress, partnerId, partnerName, displayShowrooms, applySearch, clearSearch, clearFilterParams, resetSort, router]);

  return (
    <View style={[styles.wrapper, { borderColor: colors.glassBorderOnDark }]}>
      {/* Video Background */}
      <Video
        source={backgroundVideo}
        style={styles.videoBg}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      {/* Dark tint */}
      <View style={styles.tintOverlay} />
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Header - Brand name + signature */}
        <View style={styles.header}>
          <Heading size="small" style={styles.brandName}>{displayShowrooms[0]?.name}</Heading>
          <Supporting size="medium" style={styles.signatureText}>Showroom</Supporting>
        </View>

        {/* CTA Footer */}
        <HapticPressable onPress={handleViewAllPress} style={styles.footer}>
          <Heading size="small" style={styles.browseText}>Visit Showroom</Heading>
          <View style={styles.arrowCircle}>
            <ArrowRight size={Sizes.iconSm} color="#000000" strokeWidth={2.5} />
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
  wrapper: {
    marginHorizontal: Spacing.sm,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    minHeight: 400,
    borderWidth: 1,
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  brandName: {
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  signatureText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
  },
  browseText: {
    color: '#FFFFFF',
  },
  arrowCircle: {
    width: Sizes.bubble,
    height: Sizes.bubble,
    borderRadius: Sizes.bubble / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
