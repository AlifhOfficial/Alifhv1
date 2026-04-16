/**
 * Listing Features - Extra features as list rows
 * Shows max 8 features with "+X more" row when exceeding
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PlusCircle } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { formatEnumValue } from './types';

const MAX_VISIBLE_FEATURES = 8;

interface ListingFeaturesProps {
  extras: string[];
  isBlk?: boolean;
  onViewAll?: () => void;
}

export const ListingFeatures = memo(function ListingFeatures({
  extras,
  isBlk = false,
  onViewAll,
}: ListingFeaturesProps) {
  const { colors } = useTheme();

  if (extras.length === 0) return null;

  const hasMore = extras.length > MAX_VISIBLE_FEATURES;
  const visibleExtras = hasMore ? extras.slice(0, MAX_VISIBLE_FEATURES) : extras;
  const isInteractive = hasMore && Boolean(onViewAll);

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface }]}> 
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Features</Text>
        {isInteractive ? (
          <PlusCircle size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
        ) : null}
      </View>
      {visibleExtras.map((extra) => (
        <React.Fragment key={extra}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text variant="subhead">{formatEnumValue(extra)}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      {isInteractive ? (
        <HapticPressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel="Open all features"
        >
          {content}
        </HapticPressable>
      ) : content}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});


