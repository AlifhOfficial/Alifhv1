/**
 * Listing Specifications - Key/Value pairs for car specs
 * Tapping "View All" fires onViewAll so the parent can open a sheet.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PlusCircle } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Stroke } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { formatEnumValue } from './types';

const MAX_VISIBLE_SPECS = 4;

export interface SpecItem {
  label: string;
  value: string | number | null | undefined;
}

interface ListingSpecsProps {
  condition?: 'new' | 'used';
  bodyType?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  engineSize?: string | null;
  cylinders?: number | null;
  powerRange?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  doors?: string | null;
  seatingCapacity?: string | null;
  steeringSide?: string;
  isBlk?: boolean;
  onViewAll?: () => void;
}

export const ListingSpecs = memo(function ListingSpecs({
  condition,
  bodyType,
  transmission,
  fuelType,
  engineSize,
  cylinders,
  powerRange,
  exteriorColor,
  interiorColor,
  doors,
  seatingCapacity,
  steeringSide,
  onViewAll,
}: ListingSpecsProps) {
  const { colors } = useTheme();

  const specs: SpecItem[] = [
    { label: 'Condition', value: formatEnumValue(condition || null) },
    { label: 'Body Type', value: formatEnumValue(bodyType) },
    { label: 'Transmission', value: formatEnumValue(transmission) },
    { label: 'Fuel Type', value: formatEnumValue(fuelType) },
    { label: 'Engine', value: engineSize },
    { label: 'Cylinders', value: cylinders },
    { label: 'Power', value: powerRange },
    { label: 'Exterior Color', value: formatEnumValue(exteriorColor) },
    { label: 'Interior Color', value: formatEnumValue(interiorColor) },
    { label: 'Doors', value: doors },
    { label: 'Seats', value: seatingCapacity },
    { label: 'Steering', value: formatEnumValue(steeringSide || null) },
  ].filter(spec => spec.value && spec.value !== '—');

  const visibleSpecs = specs.slice(0, MAX_VISIBLE_SPECS);
  const hasMore = specs.length > MAX_VISIBLE_SPECS;

  return (
    <Animated.View entering={FadeInDown.delay(0).duration(350)}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="caption1Emphasized" tone="muted" uppercase>Specifications</Text>
          {hasMore && (
            <HapticPressable onPress={onViewAll}>
              <PlusCircle size={Sizes.iconSm} color={colors.primary} strokeWidth={Stroke.icon} />
            </HapticPressable>
          )}
        </View>
        {visibleSpecs.map((spec) => (
          <React.Fragment key={spec.label}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.specRow}>
              <Text variant="subhead" tone="secondary">{spec.label}</Text>
              <Text variant="subhead">{spec.value === null || spec.value === undefined ? '—' : String(spec.value)}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});

