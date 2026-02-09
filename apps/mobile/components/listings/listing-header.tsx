/**
 * Listing Header - Title, Price, Actions, Highlights
 */

import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { SpecialNotes } from '@/lib/api';
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
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {carTitle}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: priceColor }]}>
              {formatPrice(price)}
            </Text>
            {isNegotiable && (
              <Text style={[styles.negotiable, { color: colors.success }]}>
                Negotiable
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
        {isBlk && (
          <View style={[styles.blkBadge, { backgroundColor: colors.blkBackground }]}>
            <Text style={[styles.blkText, { color: colors.blkText }]}>BLK</Text>
          </View>
        )}
        <Pressable
          onPress={handleFavoritePress}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Heart
            size={20}
            color={isFavorite ? colors.favorite : colors.icon}
            fill={isFavorite ? colors.favorite : 'none'}
            strokeWidth={isFavorite ? 2.25 : 1.75}
          />
        </Pressable>
        <Pressable
          onPress={handleSuperlikePress}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Sparkles
            size={20}
            color={isSuperliked ? colors.warning : colors.icon}
            fill={isSuperliked ? colors.warning : 'none'}
            strokeWidth={1.75}
          />
        </Pressable>
        </View>
      </View>

      {/* Highlights below price */}
      {highlights.length > 0 && (
        <View style={styles.highlightsRow}>
          {highlights.map((highlight, idx) => (
            <View key={idx} style={styles.highlightItem}>
              <CheckCircle2 size={14} color={colors.success} />
              <Text style={[styles.highlightText, { color: textColor }]}>
                {highlight}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

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
    gap: 4,
  },
  title: {
    ...Typography.headingLarge,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  price: {
    ...Typography.priceTag,
  },
  negotiable: {
    ...Typography.dataMini,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  blkText: {
    ...Typography.labelBadge,
    fontFamily: 'Inter_700Bold',
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
    gap: 4,
  },
  highlightText: {
    ...Typography.dataMini,
  },
});
