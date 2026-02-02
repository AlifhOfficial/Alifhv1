/**
 * FilterPill Component
 * 
 * Individual filter chip with active/expanded states.
 * Clean design without chevrons - relies on color states for affordance.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, Typography } from '@/constants/theme';
import type { FilterPillProps } from './types';

export function FilterPill({
  label,
  hasValue,
  isExpanded,
  onPress,
  onClear,
  colors,
}: FilterPillProps) {
  // Determine visual state - use darker, more subtle backgrounds
  const getBackgroundColor = () => {
    if (isExpanded) return colors.backgroundTertiary;
    if (hasValue) return colors.backgroundTertiary;
    return colors.backgroundSecondary;
  };

  const getTextColor = () => {
    if (isExpanded) return colors.text;
    if (hasValue) return colors.text;
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.pill,
        { backgroundColor: getBackgroundColor() },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          { color: getTextColor() },
          hasValue && styles.labelActive,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Show clear button only when has value and not expanded */}
      {hasValue && !isExpanded && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onClear();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.clearButton}
        >
          <Ionicons name="close" size={12} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  label: {
    ...Typography.subhead,
    fontFamily: 'Inter_400Regular',
  },
  labelActive: {
    fontFamily: 'Inter_500Medium',
  },
  clearButton: {
    marginLeft: Spacing.xs,
  },
});
