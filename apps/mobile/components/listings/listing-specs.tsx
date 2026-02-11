/**
 * Listing Specifications - Key/Value pairs for car specs
 * Tapping "View All" fires onViewAll so the parent can open a sheet.
 */

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { ChevronRight } from 'lucide-react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Label, Data, Supporting } from '@/components/ui';
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
  const displayValue = value === null || value === undefined ? '—' : String(value);
  
  return (
    <View style={styles.specRow}>
      <Supporting size="medium" tone="muted">{label}</Supporting>
      <Data size="medium">{displayValue}</Data>
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
      <Label size="medium" tone="muted">
        SPECIFICATIONS
      </Label>
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
        <HapticPressable onPress={onViewAll} style={styles.viewAllButton}>
          {({ pressed }) => (
            <View style={[styles.viewAllContent, { opacity: pressed ? 0.7 : 1 }]}>
              <Data size="medium" tone="primary">
                View All Specifications
              </Data>
              <ChevronRight size={ICON_SIZE_SM} color={colors.primary} strokeWidth={2} />
            </View>
          )}
        </HapticPressable>
      )}
    </View>
  );
});

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZE_SM = 18;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
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
  viewAllButton: {
    paddingVertical: Spacing.xs,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
