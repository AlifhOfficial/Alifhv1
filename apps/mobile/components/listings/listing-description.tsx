/**
 * Listing Description - Truncated description with "Read more" callback
 *
 * Uses a hidden full-text render to reliably detect whether
 * the description overflows MAX_LINES on both iOS & Android.
 * Tapping "Read more" fires onReadMore so the parent can open a sheet.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PlusCircle } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface ListingDescriptionProps {
  description: string;
  isBlk?: boolean;
  onReadMore?: () => void;
}

const DISPLAY_WORD_LIMIT = 120;

const truncateByWords = (text: string, wordLimit: number) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(' ')}…`;
};

export const ListingDescription = memo(function ListingDescription({
  description,
  isBlk = false,
  onReadMore,
}: ListingDescriptionProps) {
  const { colors } = useTheme();
  const preview = truncateByWords(description, DISPLAY_WORD_LIMIT);
  const isInteractive = Boolean(onReadMore);

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface }]}> 
      <View style={styles.headerRow}>
        <Text variant="caption1Emphasized" tone="muted" uppercase>Description</Text>
        {isInteractive ? (
          <PlusCircle size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
        ) : null}
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.body}>
        <Text variant="subhead" tone="secondary" numberOfLines={6} selectable>
          {preview}
        </Text>
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      {isInteractive ? (
        <HapticPressable
          onPress={onReadMore}
          accessibilityRole="button"
          accessibilityLabel="Open full description"
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
  },
  body: {
    padding: Spacing.lg,
  },
});

