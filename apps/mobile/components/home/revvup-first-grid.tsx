/**
 * Revvup First Grid - Founding Partners Showcase
 * Horizontal scrolling partner cards with clean design
 * Light theme to complement the dark BLK grid
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { HapticPressable, Body, Heading } from '@/components/ui';
import { RevvupLogo } from '@/components/ui/loaders';
import { foundingPartners, type Partner } from './mock-data';
import { FirstDoodle } from './first-doodle';

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 56;
const IMAGE_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ============================================================================
// UTILITIES
// ============================================================================

/** Convert image source to expo-image compatible format */
function toImageSource(source: ImageSourcePropType | string | undefined): ImageSource | undefined {
  if (!source) return undefined;
  return typeof source === 'string' ? { uri: source } : source;
}

// ============================================================================
// PARTNER CARD
// ============================================================================

interface PartnerCardProps {
  partner: Partner;
  onPress?: (partnerId: string) => void;
}

const PartnerCard = memo(function PartnerCard({
  partner,
  onPress,
}: PartnerCardProps) {
  const handlePress = useCallback(() => {
    onPress?.(partner.id);
  }, [partner.id, onPress]);

  return (
    <HapticPressable onPress={handlePress} style={styles.partnerItem}>
      {/* Circular Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={toImageSource(partner.logo)}
          style={styles.avatar}
          contentFit="cover"
          placeholder={IMAGE_BLURHASH}
          transition={200}
        />
      </View>

      {/* Partner Name */}
      <Text style={styles.partnerName} numberOfLines={1}>
        {partner.name}
      </Text>
    </HapticPressable>
  );
});

// ============================================================================
// REVVUP FIRST GRID COMPONENT
// ============================================================================

interface RevvupFirstGridProps {
  onBrowseAllPress?: () => void;
  onPartnerPress?: (partnerId: string) => void;
}

export const RevvupFirstGrid = memo(function RevvupFirstGrid({
  onBrowseAllPress,
  onPartnerPress,
}: RevvupFirstGridProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleBrowseAllPress = useCallback(() => {
    onBrowseAllPress?.();
    // Navigate to partners list
  }, [onBrowseAllPress]);

  const handlePartnerPress = useCallback((partnerId: string) => {
    onPartnerPress?.(partnerId);
    router.push(`/seller-contact/${partnerId}` as any);
  }, [onPartnerPress, router]);

  // Background color - Deep Dark Burgundy (close to BLK darkness)
  const bgColor = '#2D1216';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Text Doodle Background - "first" scattered pattern in gold */}
      <FirstDoodle opacity={1} color="#D4AF37" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <RevvupLogo size={32} color="#FAFAFA" />
        </View>
      </View>

      {/* Founding Partners Tagline */}
      <View style={styles.taglineRow}>
        <Text style={styles.taglineText}>founding partners</Text>
      </View>

      {/* Horizontal Scrolling Partner Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {foundingPartners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            onPress={handlePartnerPress}
          />
        ))}
      </ScrollView>

      {/* Browse All Footer */}
      <HapticPressable onPress={handleBrowseAllPress} style={styles.footer}>
        <Heading size="small" style={styles.browseAllText}>
          Browse all
        </Heading>
        <View style={styles.arrowCircle}>
          <ArrowRight size={14} color="#722F37" strokeWidth={2.5} />
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
    ...Typography.blkSignature,
    color: 'rgba(250,250,250,0.6)',
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    gap: Spacing['3xl'],
  },
  partnerItem: {
    alignItems: 'center',
    width: AVATAR_SIZE + Spacing['2xl'],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#1A0A0C',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  partnerName: {
    ...Typography.bodySmall,
    color: '#FAFAFA',
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
    color: '#FAFAFA',
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
