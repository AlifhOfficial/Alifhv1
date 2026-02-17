/**
 * Showrooms Showcase Grid
 * Single video background with brand name overlay
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';

import { Spacing, Radius, Fonts, Typography, Sizes, Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Heading } from '@/components/ui';
import { showrooms } from './mock-data';

// ============================================================================
// SHOWROOMS SHOWCASE GRID
// ============================================================================

interface ShowroomsShowcaseGridProps {
  onViewAllPress?: () => void;
  limit?: number;
  offset?: number;
}

export const ShowroomsShowcaseGrid = memo(function ShowroomsShowcaseGrid({
  onViewAllPress,
  limit,
  offset = 0,
}: ShowroomsShowcaseGridProps) {
  const { colors } = useTheme();
  const start = offset % showrooms.length;
  const displayShowrooms = limit ? showrooms.slice(start, start + limit) : showrooms;
  // Use first showroom's video as background
  const backgroundVideo = displayShowrooms[0]?.heroVideo;

  const handleViewAllPress = useCallback(() => {
    onViewAllPress?.();
  }, [onViewAllPress]);

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
          <Text style={styles.brandName}>{displayShowrooms[0]?.name}</Text>
          <Text style={styles.signatureText}>showroom</Text>
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
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  signatureText: {
    ...Typography.blkSignature,
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
