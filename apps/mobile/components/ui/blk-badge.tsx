import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useThemeSafe } from '@/context/theme-context';

import { Text } from './text';

type BlkBadgeSize = 'sm' | 'md';

interface BlkBadgeProps {
  size?: BlkBadgeSize;
  style?: StyleProp<ViewStyle>;
}

export function BlkBadge({ size = 'md', style }: BlkBadgeProps) {
  const { colors } = useThemeSafe();

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: colors.blkBadgeBg,
          borderColor: colors.blkBadgeBorder,
        },
        style,
      ]}
    >
      <Text
        variant={size === 'sm' ? 'caption2Emphasized' : 'caption1Emphasized'}
        style={{ color: colors.blkBadgeFg }}
      >
        BLK
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
});
