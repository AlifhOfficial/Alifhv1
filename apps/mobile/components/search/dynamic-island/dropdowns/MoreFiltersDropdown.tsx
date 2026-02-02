/**
 * MoreFiltersDropdown Component
 * 
 * Toggle filters for condition, black listings, negotiable, specs.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Spacing, Radius, Typography } from '@/constants/theme';
import type { ThemeColors, Filters } from '../types';

interface MoreFiltersDropdownProps {
  filters: Filters;
  specs: Array<{ value: string; count: number }>;
  onFilterChange: (key: string, value: any) => void;
  colors: ThemeColors;
}

export function MoreFiltersDropdown({
  filters,
  specs,
  onFilterChange,
  colors,
}: MoreFiltersDropdownProps) {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Condition */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Condition</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => onFilterChange('condition', filters.condition === 'new' ? undefined : 'new')}
            activeOpacity={1}
          >
            <Text style={[
              styles.toggleText,
              { color: filters.condition === 'new' ? colors.primary : colors.text }
            ]}>
              New Cars
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => onFilterChange('condition', filters.condition === 'used' ? undefined : 'used')}
            activeOpacity={1}
          >
            <Text style={[
              styles.toggleText,
              { color: filters.condition === 'used' ? colors.primary : colors.text }
            ]}>
              Used Cars
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Black Collection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Black Collection</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => onFilterChange('isBlkListing', filters.isBlkListing ? undefined : true)}
            activeOpacity={1}
          >
            <Text style={[
              styles.toggleText,
              { color: filters.isBlkListing ? colors.primary : colors.text }
            ]}>
              Black Listings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleItem}
            onPress={() => onFilterChange('isBlackTierPartner', filters.isBlackTierPartner ? undefined : true)}
            activeOpacity={1}
          >
            <Text style={[
              styles.toggleText,
              { color: filters.isBlackTierPartner ? colors.primary : colors.text }
            ]}>
              Black Members
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Negotiable */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.toggleItem}
          onPress={() => onFilterChange('isNegotiable', filters.isNegotiable ? undefined : true)}
          activeOpacity={1}
        >
          <Text style={[
            styles.toggleText,
            { color: filters.isNegotiable ? colors.primary : colors.text }
          ]}>
            Negotiable prices only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Regional Specs - Multi-select */}
      {specs.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Regional Specs</Text>
          <View style={styles.toggleRow}>
            {specs.map((spec) => {
              const isSelected = filters.specs?.includes(spec.value);
              return (
                <TouchableOpacity
                  key={spec.value}
                  style={styles.toggleItem}
                  onPress={() => {
                    const currentSpecs = filters.specs || [];
                    if (isSelected) {
                      const newSpecs = currentSpecs.filter(s => s !== spec.value);
                      onFilterChange('specs', newSpecs.length > 0 ? newSpecs : undefined);
                    } else {
                      onFilterChange('specs', [...currentSpecs, spec.value]);
                    }
                  }}
                  activeOpacity={1}
                >
                  <Text style={[
                    styles.toggleText,
                    { color: isSelected ? colors.primary : colors.text }
                  ]}>
                    {spec.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Clear All in More */}
      {(filters.condition || filters.isBlkListing || filters.isBlackTierPartner || filters.isNegotiable || (filters.specs?.length || 0) > 0) && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.errorMuted }]}
          onPress={() => {
            onFilterChange('condition', undefined);
            onFilterChange('isBlkListing', undefined);
            onFilterChange('isBlackTierPartner', undefined);
            onFilterChange('isNegotiable', undefined);
            onFilterChange('specs', undefined);
          }}
        >
          <Text style={[styles.clearText, { color: colors.error }]}>Clear all filters</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.footnote,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toggleItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  toggleText: {
    ...Typography.callout,
    fontFamily: 'Inter_400Regular',
  },
  clearButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  clearText: {
    ...Typography.subhead,
    fontFamily: 'Inter_500Medium',
  },
});
