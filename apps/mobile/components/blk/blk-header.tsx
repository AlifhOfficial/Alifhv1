/**
 * BLK Header - Premium Signature Line header
 * Absolute positioned header with gradient fade for BLK screen
 * Matches BrowseHeader pattern
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Spacing, Layout, Sizes } from '@/constants/theme';
import { RevvupLogo } from '@/components/ui/loaders';
import { Label, Heading, Body } from '@/components/ui';

// Header content height for padding calculation
export const BLK_HEADER_HEIGHT = 90;

interface BlkHeaderProps {
  /** Total count of BLK listings */
  total?: number;
}

export function BlkHeader({ total = 0 }: BlkHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {/* Gradient background for fade effect */}
      <LinearGradient
        colors={['#000000', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
        locations={[0, 0.3, 0.5, 0.75, 1]}
        style={[styles.gradient, { height: insets.top + BLK_HEADER_HEIGHT + Spacing.xl }]}
        pointerEvents="none"
      />

      {/* Header Content */}
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logoContainer}>
            <RevvupLogo size={32} color="#FAFAFA" />
          </View>
          <Label size="badge" style={styles.blkText}>BLK</Label>
        </View>
        <Heading size="small" style={styles.signatureText}>Signature Line</Heading>
        {total > 0 && (
          <Body size="small" style={styles.countText}>{total} cars</Body>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    zIndex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoContainer: {
    opacity: 1,
  },
  blkText: {
    color: '#FAFAFA',
  },
  signatureText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
  },
  countText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: Spacing.xs,
  },
});
