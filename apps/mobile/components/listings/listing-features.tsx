/**
 * Listing Features - Extra features as badge chips
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { formatEnumValue } from './types';

interface ListingFeaturesProps {
  extras: string[];
  isBlk?: boolean;
}

export const ListingFeatures = memo(function ListingFeatures({
  extras,
  isBlk = false,
}: ListingFeaturesProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const textColor = isBlk ? colors.blkText : colors.text;

  if (extras.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        FEATURES
      </Text>
      <View style={styles.badgesContainer}>
        {extras.map((extra, idx) => (
          <View 
            key={idx} 
            style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Text style={[styles.badgeText, { color: textColor }]}>
              {formatEnumValue(extra)}
            </Text>
          </View>
        ))}
      </View>
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
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  badgeText: {
    ...Typography.chip,
  },
});
