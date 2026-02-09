/**
 * TrimsTab - Trims selection tab content
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import {
  FilterInput,
  SelectedPills,
  ListContainer,
  FacetListItem,
  EmptyState,
  HintText,
} from '../components';
import type { FacetBucket, ThemedComponentProps } from '../types';

interface TrimsTabProps extends ThemedComponentProps {
  trims: FacetBucket[];
  selectedTrims: string[];
  selectedModelsCount: number;
  filter: string;
  onFilterChange: (text: string) => void;
  onToggle: (value: string) => void;
  onClearAll: () => void;
}

export function TrimsTab({
  trims,
  selectedTrims,
  selectedModelsCount,
  filter,
  onFilterChange,
  onToggle,
  onClearAll,
  colors,
}: TrimsTabProps) {
  // Show empty state if no models selected
  if (selectedModelsCount === 0) {
    return (
      <EmptyState
        title="Select a model first"
        subtitle="Choose one or more models to see available trims"
        colors={colors}
      />
    );
  }

  const filteredTrims = trims.filter((t) =>
    t.label.toLowerCase().includes(filter.toLowerCase())
  );

  const unselectedTrims = filteredTrims.filter(
    (t) => !selectedTrims.includes(t.value)
  );

  // No trims available
  if (trims.length === 0) {
    return <HintText text="No trims available" colors={colors} />;
  }

  return (
    <View style={styles.section}>
      <FilterInput
        value={filter}
        onChangeText={onFilterChange}
        placeholder="Filter trims..."
        colors={colors}
      />

      <SelectedPills
        items={selectedTrims}
        facetData={trims}
        onRemove={onToggle}
        onClearAll={onClearAll}
        colors={colors}
      />

      <ListContainer colors={colors}>
        {unselectedTrims.map((trim, index) => (
          <FacetListItem
            key={trim.value}
            label={trim.label}
            count={trim.count}
            isSelected={false}
            isLastItem={index === unselectedTrims.length - 1}
            onPress={() => onToggle(trim.value)}
            colors={colors}
          />
        ))}
      </ListContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing['2xl'],
  },
});
