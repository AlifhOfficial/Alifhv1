/**
 * Listing Description - Expandable description text
 */

import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
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
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  readMore: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 8,
  },
});
