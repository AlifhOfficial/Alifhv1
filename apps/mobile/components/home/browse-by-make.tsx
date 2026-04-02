import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { HapticPressable, Text } from '@/components/ui';
import { Layout, Radius, Spacing, Sizes } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { useSearch } from '@/context/search-context';

const POPULAR_MAKES = [
  'Toyota',
  'Mercedes-Benz',
  'BMW',
  'Land Rover',
  'Porsche',
  'Nissan',
  'Lexus',
  'Audi',
] as const;

export function BrowseByMake() {
  const { colors } = useTheme();
  const { applySearch, clearFilterParams, resetSort } = useSearch();
  const router = useRouter();

  const handleMakePress = useCallback((make: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    applySearch({ make: [make] });
    clearFilterParams();
    resetSort();
    router.push('/(tabs)/(browse)' as any);
  }, [applySearch, clearFilterParams, resetSort, router]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text variant="headline">Browse by make</Text>
        <Text variant="subhead" tone="secondary">Popular brands people shop first</Text>
      </View>

      <View style={styles.grid}>
        {POPULAR_MAKES.map((make) => (
          <HapticPressable
            key={make}
            onPress={() => handleMakePress(make)}
            style={[
              styles.pill,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text variant="subhead">{make}</Text>
          </HapticPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    minHeight: Sizes.pillHeight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});