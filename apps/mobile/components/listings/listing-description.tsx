/**
 * Listing Description - Expandable description text
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

interface ListingDescriptionProps {
  description: string;
  isBlk?: boolean;
}

const MAX_LINES = 4;

export const ListingDescription = memo(function ListingDescription({
  description,
  isBlk = false,
}: ListingDescriptionProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);

  const textColor = isBlk ? colors.blkTextSecondary : colors.textSecondary;

  const onTextLayout = useCallback((e: { nativeEvent: { lines: unknown[] } }) => {
    if (e.nativeEvent.lines.length > MAX_LINES) {
      setShowReadMore(true);
    }
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        DESCRIPTION
      </Text>
      <Text
        style={[styles.text, { color: textColor }]}
        numberOfLines={isExpanded ? undefined : MAX_LINES}
        onTextLayout={onTextLayout}
      >
        {description}
      </Text>
      {showReadMore && (
        <Pressable onPress={toggleExpand} hitSlop={8}>
          <Text style={[styles.readMore, { color: colors.primary }]}>
            {isExpanded ? 'Show less' : 'Read more'}
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
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  text: {
    ...Typography.bodySmall,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 24,
  },
  readMore: {
    ...Typography.link,
    marginTop: 8,
  },
});
