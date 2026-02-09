/**
 * Listing Specifications - Key/Value pairs for car specs
 * Tapping "View All" fires onViewAll so the parent can open a sheet.
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
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

function SpecRow({ label, value }: SpecItem) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const displayValue = value === null || value === undefined ? '—' : String(value);
  
  return (
    <View style={styles.specRow}>
      <Text style={[styles.specLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.specValue, { color: colors.text }]}>{displayValue}</Text>
    </View>
  );
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
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

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
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textTertiary }]}>
        SPECIFICATIONS
      </Text>
      <View style={styles.specsList}>
        {visibleSpecs.map((spec) => (
          <SpecRow 
            key={spec.label} 
            label={spec.label} 
            value={spec.value} 
          />
        ))}
      </View>

      {hasMore && (
        <Pressable onPress={onViewAll} style={styles.viewAllButton}>
          {({ pressed }) => (
            <View style={[styles.viewAllContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All Specifications
              </Text>
              <ChevronRight size={18} color={colors.primary} strokeWidth={2} />
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  label: {
    ...Typography.label,
  },
  specsList: {
    gap: 2,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  specLabel: {
    ...Typography.labelText,
  },
  specValue: {
    ...Typography.value,
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    ...Typography.value,
  },
});
