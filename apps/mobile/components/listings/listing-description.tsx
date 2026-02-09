/**
 * Listing Description - Truncated description with "Read more" callback
 *
 * Uses a hidden full-text render to reliably detect whether
 * the description overflows MAX_LINES on both iOS & Android.
 * Tapping "Read more" fires onReadMore so the parent can open a sheet.
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface ListingDescriptionProps {
  description: string;
  isBlk?: boolean;
  onReadMore?: () => void;
}

const MAX_LINES = 4;

export const ListingDescription = memo(function ListingDescription({
  description,
  isBlk = false,
  onReadMore,
}: ListingDescriptionProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [showReadMore, setShowReadMore] = useState(false);
  const [measured, setMeasured] = useState(false);

  const textColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;

  // Fired by the *hidden* full-text render (no numberOfLines).
  // Reliably reports all lines on both platforms.
  const onHiddenTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (!measured) {
        setShowReadMore(e.nativeEvent.lines.length > MAX_LINES);
        setMeasured(true);
      }
    },
    [measured],
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        DESCRIPTION
      </Text>

      {/* Hidden measurer — same style, no truncation, off-screen */}
      {!measured && (
        <Text
          style={[styles.text, styles.hiddenText, { color: textColor }]}
          onTextLayout={onHiddenTextLayout}
        >
          {description}
        </Text>
      )}

      {/* Visible text — always truncated to MAX_LINES */}
      <Text
        style={[styles.text, { color: textColor }]}
        numberOfLines={MAX_LINES}
      >
        {description}
      </Text>

      {showReadMore && (
        <Pressable onPress={onReadMore} hitSlop={8}>
          <Text style={[styles.readMore, { color: colors.primary }]}>
            Read more
          </Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.label,
  },
  text: {
    ...Typography.bodySmall,  // 15 / 22 / Inter_500Medium — readable body weight
  },
  hiddenText: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  readMore: {
    ...Typography.link,
  },
});
