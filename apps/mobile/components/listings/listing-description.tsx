/**
 * Listing Description - Truncated description with "Read more" callback
 *
 * Uses a hidden full-text render to reliably detect whether
 * the description overflows MAX_LINES on both iOS & Android.
 * Tapping "Read more" fires onReadMore so the parent can open a sheet.
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text as RNText } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
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

  const textColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;

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
      <Label size="medium" tone="muted">
        DESCRIPTION
      </Label>

      {/* Hidden measurer — same style, no truncation, off-screen */}
      {!measured && (
        <RNText
          style={[styles.hiddenText, { color: textColor }]}
          onTextLayout={onHiddenTextLayout}
        >
          {description}
        </RNText>
      )}

      {/* Visible text — always truncated to 3 lines */}
      <Body size="medium" style={{ color: textColor }} numberOfLines={3}>
        {description}
      </Body>

      {showReadMore && (
        <Pressable onPress={onReadMore} hitSlop={8}>
          <Text variant="link" tone="primary">
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
  hiddenText: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_500Medium',
  },
});
