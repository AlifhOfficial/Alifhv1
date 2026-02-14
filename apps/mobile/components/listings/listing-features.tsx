/**
 * Listing Features - Extra features as badge chips
 * Shows max 8 features with "+X more" option when exceeding
 * Features are arranged to fill rows efficiently (bin-packing)
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { HapticPressable } from '@/components/ui';

import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Label, Text } from '@/components/ui';
import { formatEnumValue } from './types';

const MAX_VISIBLE_FEATURES = 8;
const BADGE_H_PADDING = Spacing.md * 2; // horizontal padding both sides
const BADGE_GAP = Spacing.sm;
const CHAR_WIDTH = 7.5;

interface ListingFeaturesProps {
  extras: string[];
  isBlk?: boolean;
  onViewAll?: () => void;
}

// Estimate badge width based on text
function estimateBadgeWidth(text: string): number {
  const formatted = formatEnumValue(text);
  return BADGE_H_PADDING + (formatted.length * CHAR_WIDTH);
}

// Greedy bin-packing: arrange items to fill rows efficiently
function arrangeForBestFit(items: string[], containerWidth: number): string[] {
  if (containerWidth <= 0 || items.length === 0) return items;

  const remaining = [...items];
  const arranged: string[] = [];
  let currentRowWidth = 0;

  while (remaining.length > 0) {
    // Find the best fitting item for current row
    let bestIndex = -1;
    let bestWidth = 0;
    const availableWidth = containerWidth - currentRowWidth - (currentRowWidth > 0 ? BADGE_GAP : 0);

    // First, try to find an item that fits in the remaining space
    for (let i = 0; i < remaining.length; i++) {
      const width = estimateBadgeWidth(remaining[i]);
      if (width <= availableWidth && width > bestWidth) {
        bestWidth = width;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      // Found an item that fits
      arranged.push(remaining[bestIndex]);
      currentRowWidth += (currentRowWidth > 0 ? BADGE_GAP : 0) + bestWidth;
      remaining.splice(bestIndex, 1);
    } else {
      // No item fits, start new row with the smallest remaining item
      const smallestIndex = remaining.reduce((minIdx, item, idx, arr) => 
        estimateBadgeWidth(item) < estimateBadgeWidth(arr[minIdx]) ? idx : minIdx, 0);
      arranged.push(remaining[smallestIndex]);
      currentRowWidth = estimateBadgeWidth(remaining[smallestIndex]);
      remaining.splice(smallestIndex, 1);
    }
  }

  return arranged;
}

export const ListingFeatures = memo(function ListingFeatures({
  extras,
  isBlk = false,
  onViewAll,
}: ListingFeaturesProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [containerWidth, setContainerWidth] = useState(0);

  const textColor = isBlk ? colors.blkText : colors.text;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Arrange features to fill space efficiently
  const arrangedExtras = useMemo(() => {
    return arrangeForBestFit(extras, containerWidth);
  }, [extras, containerWidth]);
  
  const hasMore = arrangedExtras.length > MAX_VISIBLE_FEATURES;
  const visibleExtras = hasMore ? arrangedExtras.slice(0, MAX_VISIBLE_FEATURES) : arrangedExtras;
  const remainingCount = arrangedExtras.length - MAX_VISIBLE_FEATURES;

  if (extras.length === 0) return null;

  return (
    <View style={styles.container}>
      <Label size="medium" tone="muted">
        FEATURES
      </Label>
      <View style={styles.badgesContainer} onLayout={handleLayout}>
        {visibleExtras.map((extra, idx) => (
          <View 
            key={idx} 
            style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Text variant="chip" style={{ color: textColor }}>
              {formatEnumValue(extra)}
            </Text>
          </View>
        ))}
        {hasMore && (
          <HapticPressable 
            onPress={onViewAll}
            style={[styles.badge, { backgroundColor: colors.primary + '15' }]}
          >
            <Text variant="chip" tone="primary">
              +{remainingCount} more
            </Text>
          </HapticPressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
});
