/**
 * SearchTab - Search tab content with suggestions and popular makes
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import {
  SectionHeader,
  ListContainer,
  SuggestionListItem,
  EmptyState,
  HintText,
  LoadingState,
} from '../components';
import type { Suggestion, ThemedComponentProps } from '../types';

interface SearchTabProps extends ThemedComponentProps {
  query: string;
  suggestions: Suggestion[];
  popularMakes: Suggestion[];
  isLoading: boolean;
  isFetchingPopular: boolean;
  onSuggestionPress: (suggestion: Suggestion) => void;
}

export function SearchTab({
  query,
  suggestions,
  popularMakes,
  isLoading,
  isFetchingPopular,
  onSuggestionPress,
  colors,
}: SearchTabProps) {
  // Loading state
  if (isFetchingPopular) {
    return <LoadingState colors={colors} />;
  }

  // Show popular makes when no query
  if (!query.trim() && popularMakes.length > 0) {
    return (
      <View style={styles.section}>
        <SectionHeader title="Popular Brands" colors={colors} />
        <ListContainer colors={colors}>
          {popularMakes.map((item, index) => (
            <SuggestionListItem
              key={`popular-${item.text}-${index}`}
              text={item.text}
              count={item.count}
              isLastItem={index === popularMakes.length - 1}
              onPress={() => onSuggestionPress(item)}
              colors={colors}
            />
          ))}
        </ListContainer>
      </View>
    );
  }

  // Show suggestions when query exists
  if (query.trim() && suggestions.length > 0) {
    return (
      <View style={styles.section}>
        <SectionHeader title="Suggestions" count={suggestions.length} colors={colors} />
        <ListContainer colors={colors}>
          {suggestions.map((item, index) => (
            <SuggestionListItem
              key={`suggestion-${item.type}-${item.text}-${index}`}
              text={item.text}
              count={item.count}
              isLastItem={index === suggestions.length - 1}
              onPress={() => onSuggestionPress(item)}
              colors={colors}
            />
          ))}
        </ListContainer>
      </View>
    );
  }

  // No results found
  if (!isLoading && query.trim().length >= 2 && suggestions.length === 0) {
    return (
      <EmptyState
        title="No results found"
        subtitle="Try searching for a different make or model"
        colors={colors}
      />
    );
  }

  // Initial state - no query
  if (!query.trim() && !isFetchingPopular && popularMakes.length === 0) {
    return <HintText text="Start typing to search" colors={colors} />;
  }

  return null;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing['2xl'],
  },
});
