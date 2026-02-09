/**
 * SearchSheet - Bottom Sheet for search with multi-select
 * Uses @gorhom/bottom-sheet modal for proper iOS gesture handling
 *
 * Features:
 * - Text search with autocomplete suggestions
 * - Multi-select makes with facet counts
 * - Hierarchical models (when makes selected)
 * - Hierarchical trims (when models selected)
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  searchApi,
  type Suggestion,
  type FacetBucket,
  type SearchFacets,
  toggleArrayValue,
} from '@/lib/search-api';

import type { SearchSheetProps, TabType } from './types';
import { SearchHeader, SearchInput, TabBar, SearchButton } from './components';
import { SearchTab, MakesTab, ModelsTab, TrimsTab } from './tabs';

// ============================================================================
// CONSTANTS
// ============================================================================

const SNAP_POINTS = ['92%'];
const SEARCH_DEBOUNCE_MS = 350;
const LOADING_DELAY_MS = 100;
const POPULAR_MAKES_COUNT = 8;
const HANDLE_INDICATOR_WIDTH = 36;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SearchSheet({ visible, onClose, onSearch }: SearchSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snap points - memoized for performance
  const snapPoints = useMemo(() => SNAP_POINTS, []);

  // State - Search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [popularMakes, setPopularMakes] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPopular, setIsFetchingPopular] = useState(false);

  // State - Multi-select
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedTrims, setSelectedTrims] = useState<string[]>([]);

  // State - Facets
  const [facets, setFacets] = useState<SearchFacets | null>(null);
  const [modelFacets, setModelFacets] = useState<FacetBucket[]>([]);
  const [trimFacets, setTrimFacets] = useState<FacetBucket[]>([]);
  const [isFetchingFacets, setIsFetchingFacets] = useState(false);

  // State - Filter within lists
  const [makeFilter, setMakeFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [trimFilter, setTrimFilter] = useState('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Handle open/close based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  // Fetch initial facets (makes)
  useEffect(() => {
    if (visible && !facets) {
      setIsFetchingFacets(true);
      searchApi
        .getFacets()
        .then((f) => setFacets(f))
        .catch(console.error)
        .finally(() => setIsFetchingFacets(false));
    }
  }, [visible, facets]);

  // Fetch popular makes on mount
  useEffect(() => {
    if (visible && popularMakes.length === 0) {
      setIsFetchingPopular(true);
      searchApi
        .popularMakes(POPULAR_MAKES_COUNT)
        .then((res) => setPopularMakes(res.suggestions))
        .catch(console.error)
        .finally(() => setIsFetchingPopular(false));
    }
  }, [visible, popularMakes.length]);

  // Fetch models when makes change
  useEffect(() => {
    if (selectedMakes.length > 0) {
      searchApi
        .getModelsForMakes(selectedMakes)
        .then((models) => setModelFacets(models))
        .catch(console.error);
    } else {
      setModelFacets([]);
      setSelectedModels([]);
      setSelectedTrims([]);
    }
  }, [selectedMakes]);

  // Fetch trims when models change
  useEffect(() => {
    if (selectedMakes.length > 0 && selectedModels.length > 0) {
      searchApi
        .getTrimsForModels(selectedMakes, selectedModels)
        .then((trims) => setTrimFacets(trims))
        .catch(console.error);
    } else {
      setTrimFacets([]);
      setSelectedTrims([]);
    }
  }, [selectedMakes, selectedModels]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const loadingTimer = setTimeout(() => setIsLoading(true), LOADING_DELAY_MS);

    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await searchApi.suggest(query.trim(), {
          make: selectedMakes.length > 0 ? selectedMakes : undefined,
          model: selectedModels.length > 0 ? selectedModels : undefined,
        });
        if (!controller.signal.aborted) {
          setSuggestions(res.suggestions);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Suggest error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          clearTimeout(loadingTimer);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(loadingTimer);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, selectedMakes, selectedModels]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // Reset state on close
        setQuery('');
        setSelectedMakes([]);
        setSelectedModels([]);
        setSelectedTrims([]);
        setActiveTab('search');
        setMakeFilter('');
        setModelFilter('');
        setTrimFilter('');
        onClose();
      }
    },
    [onClose]
  );

  const handleSuggestionPress = useCallback(
    (suggestion: Suggestion) => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const params: {
        q?: string;
        make?: string[];
        model?: string[];
        trim?: string[];
      } = {};

      if (suggestion.type === 'make') {
        params.make = [suggestion.make || suggestion.text];
      } else if (suggestion.type === 'make_model' || suggestion.type === 'model') {
        if (suggestion.make) params.make = [suggestion.make];
        if (suggestion.model) params.model = [suggestion.model];
      } else if (suggestion.type === 'make_model_trim') {
        if (suggestion.make) params.make = [suggestion.make];
        if (suggestion.model) params.model = [suggestion.model];
        if (suggestion.trim) params.trim = [suggestion.trim];
      } else {
        params.q = suggestion.text;
      }

      onSearch?.(params);
      bottomSheetRef.current?.dismiss();
    },
    [onSearch]
  );

  const handleSubmit = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const params: {
      q?: string;
      make?: string[];
      model?: string[];
      trim?: string[];
    } = {};
    if (query.trim()) params.q = query.trim();
    if (selectedMakes.length > 0) params.make = selectedMakes;
    if (selectedModels.length > 0) params.model = selectedModels;
    if (selectedTrims.length > 0) params.trim = selectedTrims;

    if (Object.keys(params).length > 0) {
      onSearch?.(params);
      bottomSheetRef.current?.dismiss();
    }
  }, [query, selectedMakes, selectedModels, selectedTrims, onSearch]);

  const handleCancel = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const toggleMake = useCallback(
    (value: string) => {
      triggerHaptic();
      setSelectedMakes((prev) => toggleArrayValue(prev, value) || []);
    },
    [triggerHaptic]
  );

  const toggleModel = useCallback(
    (value: string) => {
      triggerHaptic();
      setSelectedModels((prev) => toggleArrayValue(prev, value) || []);
    },
    [triggerHaptic]
  );

  const toggleTrim = useCallback(
    (value: string) => {
      triggerHaptic();
      setSelectedTrims((prev) => toggleArrayValue(prev, value) || []);
    },
    [triggerHaptic]
  );

  const clearMakes = useCallback(() => {
    triggerHaptic();
    setSelectedMakes([]);
    setSelectedModels([]);
    setSelectedTrims([]);
  }, [triggerHaptic]);

  const clearModels = useCallback(() => {
    triggerHaptic();
    setSelectedModels([]);
    setSelectedTrims([]);
  }, [triggerHaptic]);

  const clearTrims = useCallback(() => {
    triggerHaptic();
    setSelectedTrims([]);
  }, [triggerHaptic]);

  const handleSearchFocus = useCallback(() => {
    setActiveTab('search');
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasSelections =
    selectedMakes.length > 0 ||
    selectedModels.length > 0 ||
    selectedTrims.length > 0;
  const canSearch = !!(query.trim() || hasSelections);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
        width: HANDLE_INDICATOR_WIDTH,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.sheetContent}>
        {/* Header */}
        <View style={styles.header}>
          <SearchHeader title="Search" onCancel={handleCancel} colors={colors} />

          <SearchInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            onFocus={handleSearchFocus}
            colors={colors}
          />

          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedMakesCount={selectedMakes.length}
            selectedModelsCount={selectedModels.length}
            selectedTrimsCount={selectedTrims.length}
            colors={colors}
          />
        </View>

        {/* Scrollable Content */}
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'search' && (
            <SearchTab
              query={query}
              suggestions={suggestions}
              popularMakes={popularMakes}
              isLoading={isLoading}
              isFetchingPopular={isFetchingPopular}
              onSuggestionPress={handleSuggestionPress}
              colors={colors}
            />
          )}
          {activeTab === 'makes' && (
            <MakesTab
              makes={facets?.make || []}
              selectedMakes={selectedMakes}
              filter={makeFilter}
              onFilterChange={setMakeFilter}
              onToggle={toggleMake}
              onClearAll={clearMakes}
              isLoading={isFetchingFacets}
              colors={colors}
            />
          )}
          {activeTab === 'models' && (
            <ModelsTab
              models={modelFacets}
              selectedModels={selectedModels}
              selectedMakesCount={selectedMakes.length}
              filter={modelFilter}
              onFilterChange={setModelFilter}
              onToggle={toggleModel}
              onClearAll={clearModels}
              colors={colors}
            />
          )}
          {activeTab === 'trims' && (
            <TrimsTab
              trims={trimFacets}
              selectedTrims={selectedTrims}
              selectedModelsCount={selectedModels.length}
              filter={trimFilter}
              onFilterChange={setTrimFilter}
              onToggle={toggleTrim}
              onClearAll={clearTrims}
              colors={colors}
            />
          )}
          {/* Bottom spacing for search button */}
          <View style={styles.bottomSpacer} />
        </BottomSheetScrollView>

        {/* Bottom Search Button */}
        <SearchButton
          onPress={handleSubmit}
          disabled={!canSearch}
          query={query}
          selectedMakes={selectedMakes}
          selectedModels={selectedModels}
          selectedTrims={selectedTrims}
          colors={colors}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  bottomSpacer: {
    height: 120,
  },
});

export type { SearchSheetProps } from './types';
