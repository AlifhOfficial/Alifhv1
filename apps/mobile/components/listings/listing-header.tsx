/**
 * Listing Header - Title, Price, Actions, Highlights
 */

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Text, Heading, Data, Label } from '@/components/ui';
import { SpecialNotes } from '@/lib/listing-api';
import { formatPrice } from './types';

interface ListingHeaderProps {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  price: number;
  isNegotiable?: boolean;
  isBlk?: boolean;
  isFavorite?: boolean;
  isSuperliked?: boolean;
  specialNotes?: SpecialNotes;
  tags?: string[];
  onFavoritePress?: (id: string) => void;
  onSuperlikePress?: (id: string) => void;
}

export const ListingHeader = memo(function ListingHeader({
  id,
  year,
  make,
  model,
  trim,
  price,
  isNegotiable,
  isBlk = false,
  isFavorite = false,
  isSuperliked = false,
  specialNotes,
  tags = [],
  onFavoritePress,
  onSuperlikePress,
}: ListingHeaderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const carTitle = `${year} ${make} ${model}${trim ? ` ${trim}` : ''}`;
  
  // Use standard theme colors (BLK branding shown via badge only)
  const textColor = colors.text;
  const priceColor = colors.primary;

  // Highlights from special notes and tags
  const highlights = useMemo(() => {
    const items: string[] = [...tags];
    if (specialNotes?.serviceHistory) items.push('Full Service History');
    if (specialNotes?.singleOwner) items.push('Single Owner');
    if (specialNotes?.accidentFree) items.push('Accident Free');
    if (specialNotes?.underWarranty) items.push('Under Warranty');
    return items;
  }, [tags, specialNotes]);

  const handleFavoritePress = useCallback(() => {
    onFavoritePress?.(id);
  }, [id, onFavoritePress]);

  const handleSuperlikePress = useCallback(() => {
    onSuperlikePress?.(id);
  }, [id, onSuperlikePress]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Heading size="large" style={{ color: textColor }} numberOfLines={2}>
            {carTitle}
          </Heading>
          <View style={styles.priceRow}>
            <Text variant="priceTag" style={{ color: priceColor }}>
              {formatPrice(price)}
            </Text>
            {isNegotiable && (
              <Data size="mini" tone="success">
                Negotiable
              </Data>
            )}
          </View>
        </View>

        <View style={styles.actions}>
        {isBlk && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBadgeBackground }]}>
            <Label size="badge" uppercase={false} style={{ color: colors.blkBadgeText }}>BLK</Label>
          </View>
        )}
        <HapticPressable
          onPress={handleFavoritePress}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Heart
            size={ICON_SIZE}
            color={isFavorite ? colors.favorite : colors.icon}
            fill={isFavorite ? colors.favorite : 'none'}
            strokeWidth={isFavorite ? 2.25 : 1.75}
          />
        </HapticPressable>
        <HapticPressable
          onPress={handleSuperlikePress}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Sparkles
            size={ICON_SIZE}
            color={isSuperliked ? colors.warning : colors.icon}
            fill={isSuperliked ? colors.warning : 'none'}
            strokeWidth={1.75}
          />
        </HapticPressable>
        </View>
      </View>

      {/* Highlights below price */}
      {highlights.length > 0 && (
        <View style={styles.highlightsRow}>
          {highlights.map((highlight, idx) => (
            <View key={idx} style={styles.highlightItem}>
              <CheckCircle2 size={ICON_SIZE_SM} color={colors.success} />
              <Data size="mini" style={{ color: textColor }}>
                {highlight}
              </Data>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZE = 20;
const ICON_SIZE_SM = 14;
const ACTION_BTN_SIZE = 40;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: ACTION_BTN_SIZE,
    height: ACTION_BTN_SIZE,
    borderRadius: ACTION_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blkBadge: {
    paddingHorizontal: Spacing.sm - 2,
    paddingVertical: 2,
    borderRadius: Radius.none,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    rowGap: Spacing.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
