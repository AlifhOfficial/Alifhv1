/**
 * Advanced Filters Sheet
 * 
 * Bottom sheet containing advanced filters:
 * - Body Type
 * - Fuel Type
 * - Transmission
 * - Regional Specs
 * - Mileage
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '@/constants/theme';
import type { SearchFacets } from '@/lib/api';

// ============================================================================
// FILTER CONSTANTS (matching web)
// ============================================================================

const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'crossover', label: 'Crossover' },
];

const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'plugin_hybrid', label: 'Plug-in Hybrid' },
];

const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

const SPECS_TYPES = [
  { value: 'gcc', label: 'GCC' },
  { value: 'american', label: 'American' },
  { value: 'european', label: 'European' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'other', label: 'Other' },
];

const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
  { label: 'Under 150K', max: 150000 },
];

// ============================================================================
// TYPES
// ============================================================================

type AdvancedFiltersSheetProps = {
  visible: boolean;
  onClose: () => void;
  filters: {
    bodyType?: string[];
    fuelType?: string[];
    transmission?: string[];
    specs?: string[];
    mileageMax?: number;
    condition?: 'new' | 'used';
    isNegotiable?: boolean;
  };
  facets?: SearchFacets;
  onFilterChange: (key: string, value: any) => void;
  onClearAll: () => void;
  colors: typeof Colors.light;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function AdvancedFiltersSheet({
  visible,
  onClose,
  filters,
  facets,
  onFilterChange,
  onClearAll,
  colors,
}: AdvancedFiltersSheetProps) {
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['bodyType']));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const current = (filters[key as keyof typeof filters] as string[]) || [];
    if (current.includes(value)) {
      onFilterChange(key, current.filter((v) => v !== value));
    } else {
      onFilterChange(key, [...current, value]);
    }
  };

  const countFilters = () => {
    let count = 0;
    count += filters.bodyType?.length || 0;
    count += filters.fuelType?.length || 0;
    count += filters.transmission?.length || 0;
    count += filters.specs?.length || 0;
    if (filters.mileageMax) count++;
    if (filters.condition) count++;
    if (filters.isNegotiable) count++;
    return count;
  };

  const filterCount = countFilters();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.dragHandle} />
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>More Filters</Text>
              {filterCount > 0 && (
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {filterCount} filter{filterCount > 1 ? 's' : ''} selected
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {filterCount > 0 && (
                <TouchableOpacity onPress={onClearAll} style={styles.resetBtn}>
                  <Text style={[styles.resetText, { color: colors.textSecondary }]}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Popular */}
          <FilterSection
            title="Popular"
            expanded={expandedSections.has('popular')}
            onToggle={() => toggleSection('popular')}
            count={
              (filters.condition === 'new' ? 1 : 0) + (filters.isNegotiable ? 1 : 0)
            }
            colors={colors}
          >
            <TouchableOpacity
              style={[
                styles.optionRow,
                filters.condition === 'new' && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() =>
                onFilterChange('condition', filters.condition === 'new' ? undefined : 'new')
              }
            >
              <Text style={[styles.optionText, { color: colors.text }]}>New Cars</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionRow,
                filters.isNegotiable && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() =>
                onFilterChange('isNegotiable', filters.isNegotiable ? undefined : true)
              }
            >
              <Text style={[styles.optionText, { color: colors.text }]}>Negotiable</Text>
            </TouchableOpacity>
          </FilterSection>

          {/* Body Type */}
          <FilterSection
            title="Body Type"
            expanded={expandedSections.has('bodyType')}
            onToggle={() => toggleSection('bodyType')}
            count={filters.bodyType?.length || 0}
            colors={colors}
          >
            {BODY_TYPES.map((type) => {
              const facetCount = facets?.bodyType.find((f) => f.value === type.value)?.count || 0;
              const isSelected = filters.bodyType?.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => toggleArrayFilter('bodyType', type.value)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{type.label}</Text>
                  <Text style={[styles.optionCount, { color: colors.textTertiary }]}>
                    {facetCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* Fuel Type */}
          <FilterSection
            title="Fuel Type"
            expanded={expandedSections.has('fuelType')}
            onToggle={() => toggleSection('fuelType')}
            count={filters.fuelType?.length || 0}
            colors={colors}
          >
            {FUEL_TYPES.map((type) => {
              const facetCount = facets?.fuelType.find((f) => f.value === type.value)?.count || 0;
              const isSelected = filters.fuelType?.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => toggleArrayFilter('fuelType', type.value)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{type.label}</Text>
                  <Text style={[styles.optionCount, { color: colors.textTertiary }]}>
                    {facetCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* Transmission */}
          <FilterSection
            title="Transmission"
            expanded={expandedSections.has('transmission')}
            onToggle={() => toggleSection('transmission')}
            count={filters.transmission?.length || 0}
            colors={colors}
          >
            {TRANSMISSION_TYPES.map((type) => {
              const facetCount =
                facets?.transmission.find((f) => f.value === type.value)?.count || 0;
              const isSelected = filters.transmission?.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => toggleArrayFilter('transmission', type.value)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{type.label}</Text>
                  <Text style={[styles.optionCount, { color: colors.textTertiary }]}>
                    {facetCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          {/* Mileage */}
          <FilterSection
            title="Mileage"
            expanded={expandedSections.has('mileage')}
            onToggle={() => toggleSection('mileage')}
            count={filters.mileageMax ? 1 : 0}
            colors={colors}
          >
            <View style={styles.presetGrid}>
              {MILEAGE_PRESETS.map((preset) => {
                const isSelected = filters.mileageMax === preset.max;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() =>
                      onFilterChange('mileageMax', isSelected ? undefined : preset.max)
                    }
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: isSelected ? colors.primaryForeground : colors.text },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FilterSection>

          {/* Regional Specs */}
          <FilterSection
            title="Regional Specs"
            expanded={expandedSections.has('specs')}
            onToggle={() => toggleSection('specs')}
            count={filters.specs?.length || 0}
            colors={colors}
          >
            {SPECS_TYPES.map((type) => {
              const facetCount = facets?.specs.find((f) => f.value === type.value)?.count || 0;
              const isSelected = filters.specs?.includes(type.value);
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => toggleArrayFilter('specs', type.value)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{type.label}</Text>
                  <Text style={[styles.optionCount, { color: colors.textTertiary }]}>
                    {facetCount}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </FilterSection>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border, paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={[styles.applyText, { color: colors.primaryForeground }]}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// FILTER SECTION COMPONENT
// ============================================================================

type FilterSectionProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count: number;
  colors: typeof Colors.light;
  children: React.ReactNode;
};

function FilterSection({
  title,
  expanded,
  onToggle,
  count,
  colors,
  children,
}: FilterSectionProps) {
  return (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <Pressable style={styles.sectionHeader} onPress={onToggle}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <View style={styles.sectionRight}>
          {count > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.countBadgeText, { color: colors.primaryForeground }]}>
                {count}
              </Text>
            </View>
          )}
          <Text style={[styles.chevron, { color: colors.textTertiary }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>
      </Pressable>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: Spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 10,
  },
  sectionContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginVertical: 2,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  optionCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  presetChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  applyBtn: {
    height: 50,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default AdvancedFiltersSheet;
