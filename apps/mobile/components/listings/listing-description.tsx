/**
 * Listing Description - Truncated description with "Read more" callback
 *
 * Uses a hidden full-text render to reliably detect whether
 * the description overflows MAX_LINES on both iOS & Android.
 * Tapping "Read more" fires onReadMore so the parent can open a sheet.
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';

import { Colors, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Label, Body, Text } from '@/components/ui';

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

  const textColor = isBlk ? colors.blkText2 : colors.labelSecondary;

  // Fired by the *hidden* full-text render (no numberOfLines).
  // Reliably reports all lines on both platforms.
  const onHiddenTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (!measured) {
        setShowReadMore(e.nativeEvent.lines.length > 3);
        setMeasured(true);
      }
    },
    [measured],
  );

  return (
    <View style={styles.container}>
      <Label size="label" tone="muted">
        DESCRIPTION
      </Label>

      {/* Hidden measurer — same style, no truncation, off-screen */}
      {!measured && (
        <Text
          variant="body"
          style={[styles.hiddenText, { color: textColor }]}
          onTextLayout={onHiddenTextLayout}
        >
          {description}
        </Text>
      )}

      {/* Visible text — always truncated to 3 lines */}
      <Body size="body" style={{ color: textColor }} numberOfLines={3}>
        {description}
      </Body>

      {showReadMore && (
        <HapticPressable onPress={onReadMore} hitSlop={Layout.hitSlopSmall}>
          <Text variant="bodySm" tone="primary">
            Read more
          </Text>
        </HapticPressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  hiddenText: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
});
