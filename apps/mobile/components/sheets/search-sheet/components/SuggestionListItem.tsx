/**
 * SuggestionListItem - List item for suggestions with chevron
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/constants/theme';
import type { ThemedComponentProps } from '../types';

interface SuggestionListItemProps extends ThemedComponentProps {
  text: string;
  count?: number;
  isLastItem: boolean;
  onPress: () => void;
}

export function SuggestionListItem({
  text,
  count,
  isLastItem,
  onPress,
  colors,
}: SuggestionListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
          borderBottomColor: colors.border,
          borderBottomWidth: isLastItem ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={1}>
        {text}
      </Text>
      <View style={styles.right}>
        {count !== undefined && count > 0 && (
          <Text style={[styles.count, { color: colors.textTertiary }]}>
            {count.toLocaleString()}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    ...Typography.buttonMedium,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  count: {
    ...Typography.link,
  },
});
