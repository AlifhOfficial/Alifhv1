/**
 * MakesTab - Makes selection tab content
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import {
  FilterInput,
  SelectedPills,
  ListContainer,
  FacetListItem,
  LoadingState,
} from '../components';
import type { FacetBucket, ThemedComponentProps } from '../types';

interface MakesTabProps extends ThemedComponentProps {
  makes: FacetBucket[];
  selectedMakes: string[];
  filter: string;
  onFilterChange: (text: string) => void;
  onToggle: (value: string) => void;
  onClearAll: () => void;
  isLoading: boolean;
}

export function MakesTab({
  makes,
  selectedMakes,
  filter,
  onFilterChange,
  onToggle,
  onClearAll,
  isLoading,
  colors,
}: MakesTabProps) {
  const filteredMakes = makes.filter((m) =>
    m.label.toLowerCase().includes(filter.toLowerCase())
  );

  const unselectedMakes = filteredMakes.filter(
    (m) => !selectedMakes.includes(m.value)
  );

  if (isLoading) {
    return <LoadingState colors={colors} />;
  }

  return (
    <View style={styles.section}>
      <FilterInput
        value={filter}
        onChangeText={onFilterChange}
        placeholder="Filter makes..."
        colors={colors}
      />

      <SelectedPills
        items={selectedMakes}
        facetData={makes}
        onRemove={onToggle}
        onClearAll={onClearAll}
        colors={colors}
      />

      <ListContainer colors={colors}>
        {unselectedMakes.map((make, index) => (
          <FacetListItem
            key={make.value}
            label={make.label}
            count={make.count}
            isSelected={false}
            isLastItem={index === unselectedMakes.length - 1}
            onPress={() => onToggle(make.value)}
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
