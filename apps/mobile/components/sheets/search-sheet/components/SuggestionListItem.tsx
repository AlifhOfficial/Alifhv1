/**
 * SuggestionListItem - List item for suggestions with chevron
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';
import { ButtonText, Body } from '@/components/ui';
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
      <ButtonText size="medium" style={styles.text} numberOfLines={1}>
        {text}
      </ButtonText>
      <View style={styles.right}>
        {count !== undefined && count > 0 && (
          <Body size="small" tone="muted">
            {count.toLocaleString()}
          </Body>
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
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  count: {},
});
