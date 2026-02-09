/**
 * FacetListItem - List item with checkbox for facet selection
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/constants/theme';
import { ButtonText, Supporting } from '@/components/ui';
import type { ThemedComponentProps } from '../types';

interface FacetListItemProps extends ThemedComponentProps {
  label: string;
  count?: number;
  isSelected: boolean;
  isLastItem: boolean;
  onPress: () => void;
}

export function FacetListItem({
  label,
  count,
  isSelected,
  isLastItem,
  onPress,
  colors,
}: FacetListItemProps) {
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
      <View style={styles.left}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : 'transparent',
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={14} color={colors.primaryForeground} />
          )}
        </View>
        <ButtonText
          size="medium"
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
          numberOfLines={1}
        >
          {label}
        </ButtonText>
      </View>
      {count !== undefined && (
        <Supporting size="small" tone="muted">
          {count.toLocaleString()}
        </Supporting>
      )}
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  labelSelected: {
    fontFamily: 'Inter_700Bold',
  },
  count: {},
});
