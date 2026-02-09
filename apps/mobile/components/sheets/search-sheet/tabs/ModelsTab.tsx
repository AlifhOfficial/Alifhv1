/**
 * ModelsTab - Models selection tab content
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

interface ModelsTabProps extends ThemedComponentProps {
  models: FacetBucket[];
  selectedModels: string[];
  selectedMakesCount: number;
  filter: string;
  onFilterChange: (text: string) => void;
  onToggle: (value: string) => void;
  onClearAll: () => void;
}

export function ModelsTab({
  models,
  selectedModels,
  selectedMakesCount,
  filter,
  onFilterChange,
  onToggle,
  onClearAll,
  colors,
}: ModelsTabProps) {
  // Show empty state if no makes selected
  if (selectedMakesCount === 0) {
    return (
      <EmptyState
        title="Select a make first"
        subtitle="Choose one or more makes to see available models"
        colors={colors}
      />
    );
  }

  const filteredModels = models.filter((m) =>
    m.label.toLowerCase().includes(filter.toLowerCase())
  );

  const unselectedModels = filteredModels.filter(
    (m) => !selectedModels.includes(m.value)
  );

  // No models available
  if (models.length === 0) {
    return <HintText text="No models available" colors={colors} />;
  }

  return (
    <View style={styles.section}>
      <FilterInput
        value={filter}
        onChangeText={onFilterChange}
        placeholder="Filter models..."
        colors={colors}
      />

      <SelectedPills
        items={selectedModels}
        facetData={models}
        onRemove={onToggle}
        onClearAll={onClearAll}
        colors={colors}
      />

      <ListContainer colors={colors}>
        {unselectedModels.map((model, index) => (
          <FacetListItem
            key={model.value}
            label={model.label}
            count={model.count}
            isSelected={false}
            isLastItem={index === unselectedModels.length - 1}
            onPress={() => onToggle(model.value)}
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
