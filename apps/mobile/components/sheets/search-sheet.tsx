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
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import {
  searchApi,
  type Suggestion,
  type FacetBucket,
  type SearchFacets,
  toggleArrayValue,
} from '@/lib/search-api';

// ============================================================================
// TYPES
// ============================================================================

interface SearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (params: { q?: string; make?: string[]; model?: string[]; trim?: string[] }) => void;
}

type TabType = 'search' | 'makes' | 'models' | 'trims';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SearchSheet({ visible, onClose, onSearch }: SearchSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snap points - full height for search
  const snapPoints = useMemo(() => ['92%'], []);

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

  // Handle open/close based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
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
  }, [onClose]);

  // Fetch initial facets (makes)
  useEffect(() => {
    if (visible && !facets) {
      setIsFetchingFacets(true);
      searchApi.getFacets()
        .then(f => setFacets(f))
        .catch(console.error)
        .finally(() => setIsFetchingFacets(false));
    }
  }, [visible, facets]);

  // Fetch popular makes on mount
  useEffect(() => {
    if (visible && popularMakes.length === 0) {
      setIsFetchingPopular(true);
      searchApi.popularMakes(8)
        .then(res => setPopularMakes(res.suggestions))
        .catch(console.error)
        .finally(() => setIsFetchingPopular(false));
    }
  }, [visible, popularMakes.length]);

  // Fetch models when makes change
  useEffect(() => {
    if (selectedMakes.length > 0) {
      searchApi.getModelsForMakes(selectedMakes)
        .then(models => setModelFacets(models))
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
      searchApi.getTrimsForModels(selectedMakes, selectedModels)
        .then(trims => setTrimFacets(trims))
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

    const loadingTimer = setTimeout(() => setIsLoading(true), 100);

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
    }, 350);

    return () => {
      clearTimeout(loadingTimer);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, selectedMakes, selectedModels]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSuggestionPress = useCallback((suggestion: Suggestion) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const params: { q?: string; make?: string[]; model?: string[]; trim?: string[] } = {};

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
  }, [onSearch]);

  const handleSubmit = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const params: { q?: string; make?: string[]; model?: string[]; trim?: string[] } = {};
    if (query.trim()) params.q = query.trim();
    if (selectedMakes.length > 0) params.make = selectedMakes;
    if (selectedModels.length > 0) params.model = selectedModels;
    if (selectedTrims.length > 0) params.trim = selectedTrims;

    if (Object.keys(params).length > 0) {
      onSearch?.(params);
      bottomSheetRef.current?.dismiss();
    }
  }, [query, selectedMakes, selectedModels, selectedTrims, onSearch]);

  const toggleMake = useCallback((value: string) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMakes(prev => toggleArrayValue(prev, value) || []);
  }, []);

  const toggleModel = useCallback((value: string) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModels(prev => toggleArrayValue(prev, value) || []);
  }, []);

  const toggleTrim = useCallback((value: string) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTrims(prev => toggleArrayValue(prev, value) || []);
  }, []);

  const clearMakes = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMakes([]);
    setSelectedModels([]);
    setSelectedTrims([]);
  }, []);

  const clearModels = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedModels([]);
    setSelectedTrims([]);
  }, []);

  const clearTrims = useCallback(() => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTrims([]);
  }, []);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const filteredMakes = facets?.make.filter(m =>
    m.label.toLowerCase().includes(makeFilter.toLowerCase())
  ) || [];

  const filteredModels = modelFacets.filter(m =>
    m.label.toLowerCase().includes(modelFilter.toLowerCase())
  );

  const filteredTrims = trimFacets.filter(t =>
    t.label.toLowerCase().includes(trimFilter.toLowerCase())
  );

  const hasSelections = selectedMakes.length > 0 || selectedModels.length > 0 || selectedTrims.length > 0;
  const canSearch = query.trim() || hasSelections;

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
  // RENDER HELPERS
  // ============================================================================

  const renderSectionHeader = (title: string, count?: number, onClear?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
        {count !== undefined && count > 0 && (
          <Text style={{ color: colors.textTertiary }}> ({count})</Text>
        )}
      </Text>
      {onClear && (
        <Pressable onPress={onClear} hitSlop={8}>
          <Text style={[styles.clearLink, { color: colors.primary }]}>Clear</Text>
        </Pressable>
      )}
    </View>
  );

  const renderFilterInput = (
    value: string, 
    onChangeText: (text: string) => void, 
    placeholder: string
  ) => (
    <View style={[styles.filterInput, { 
      backgroundColor: colors.fillSecondary, 
      borderColor: colors.border 
    }]}>
      <Ionicons name="search" size={16} color={colors.textTertiary} />
      <BottomSheetTextInput
        style={[styles.filterInputText, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );

  const renderSelectedPills = (
    items: string[], 
    facetData: FacetBucket[] | undefined, 
    onRemove: (value: string) => void,
    onClearAll: () => void
  ) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.selectedSection}>
        <View style={styles.selectedHeader}>
          <Text style={[styles.selectedLabel, { color: colors.textSecondary }]}>
            Selected ({items.length})
          </Text>
          {items.length > 1 && (
            <Pressable onPress={onClearAll} hitSlop={8}>
              <Text style={[styles.clearLink, { color: colors.primary }]}>Clear all</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.pillsRow}>
          {items.map(item => {
            const data = facetData?.find(f => f.value === item);
            return (
              <Pressable
                key={item}
                style={[styles.pill, { backgroundColor: colors.primary }]}
                onPress={() => onRemove(item)}
              >
                <Text style={[styles.pillText, { color: colors.primaryForeground }]}>{data?.label || item}</Text>
                <Ionicons name="close" size={14} color={colors.primaryForeground} />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  // ============================================================================
  // TAB RENDERERS
  // ============================================================================

  const renderSearchTab = () => (
    <>
      {isFetchingPopular && (
        <View style={styles.loadingSection}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!isFetchingPopular && !query.trim() && popularMakes.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('Popular Brands')}
          <View style={[styles.listContainer, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border 
          }]}>
            {popularMakes.map((item, index) => (
              <Pressable
                key={`popular-${item.text}-${index}`}
                style={({ pressed }) => [
                  styles.listItem,
                  { 
                    backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                    borderBottomColor: colors.border,
                    borderBottomWidth: index < popularMakes.length - 1 ? StyleSheet.hairlineWidth : 0,
                  }
                ]}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={[styles.listItemText, { color: colors.text }]} numberOfLines={1}>
                  {item.text}
                </Text>
                <View style={styles.listItemRight}>
                  {item.count !== undefined && item.count > 0 && (
                    <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>
                      {item.count.toLocaleString()}
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {query.trim() && suggestions.length > 0 && (
        <View style={styles.section}>
          {renderSectionHeader('Suggestions', suggestions.length)}
          <View style={[styles.listContainer, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border 
          }]}>
            {suggestions.map((item, index) => (
              <Pressable
                key={`suggestion-${item.type}-${item.text}-${index}`}
                style={({ pressed }) => [
                  styles.listItem,
                  { 
                    backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                    borderBottomColor: colors.border,
                    borderBottomWidth: index < suggestions.length - 1 ? StyleSheet.hairlineWidth : 0,
                  }
                ]}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={[styles.listItemText, { color: colors.text }]} numberOfLines={1}>
                  {item.text}
                </Text>
                <View style={styles.listItemRight}>
                  {item.count !== undefined && item.count > 0 && (
                    <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>
                      {item.count.toLocaleString()}
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {!isLoading && query.trim().length >= 2 && suggestions.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Try searching for a different make or model
          </Text>
        </View>
      )}

      {!query.trim() && !isFetchingPopular && popularMakes.length === 0 && (
        <View style={styles.hintContainer}>
          <Text style={[styles.hintText, { color: colors.textTertiary }]}>
            Start typing to search
          </Text>
        </View>
      )}
    </>
  );

  const renderMakesTab = () => (
    <View style={styles.section}>
      {renderFilterInput(makeFilter, setMakeFilter, 'Filter makes...')}

      {renderSelectedPills(selectedMakes, facets?.make, toggleMake, clearMakes)}

      {isFetchingFacets ? (
        <View style={styles.loadingSection}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={[styles.listContainer, { 
          backgroundColor: colors.surface, 
          borderColor: colors.border 
        }]}>
          {filteredMakes.filter(m => !selectedMakes.includes(m.value)).map((make, index, arr) => (
            <Pressable
              key={make.value}
              style={({ pressed }) => [
                styles.listItem,
                { 
                  backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                  borderBottomColor: colors.border,
                  borderBottomWidth: index < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                }
              ]}
              onPress={() => toggleMake(make.value)}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.checkbox, { borderColor: colors.border }]} />
                <Text style={[styles.listItemText, { color: colors.text }]} numberOfLines={1}>
                  {make.label}
                </Text>
              </View>
              <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>
                {make.count?.toLocaleString()}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  const renderModelsTab = () => (
    <View style={styles.section}>
      {selectedMakes.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Select a make first</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Choose one or more makes to see available models
          </Text>
        </View>
      ) : (
        <>
          {renderFilterInput(modelFilter, setModelFilter, 'Filter models...')}
          {renderSelectedPills(selectedModels, modelFacets, toggleModel, clearModels)}

          {modelFacets.length === 0 ? (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>No models available</Text>
            </View>
          ) : (
            <View style={[styles.listContainer, { 
              backgroundColor: colors.surface, 
              borderColor: colors.border 
            }]}>
              {filteredModels.filter(m => !selectedModels.includes(m.value)).map((model, index, arr) => (
                <Pressable
                  key={model.value}
                  style={({ pressed }) => [
                    styles.listItem,
                    { 
                      backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                      borderBottomColor: colors.border,
                      borderBottomWidth: index < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                    }
                  ]}
                  onPress={() => toggleModel(model.value)}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.checkbox, { borderColor: colors.border }]} />
                    <Text style={[styles.listItemText, { color: colors.text }]} numberOfLines={1}>
                      {model.label}
                    </Text>
                  </View>
                  <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>
                    {model.count?.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderTrimsTab = () => (
    <View style={styles.section}>
      {selectedModels.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Select a model first</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Choose one or more models to see available trims
          </Text>
        </View>
      ) : (
        <>
          {renderFilterInput(trimFilter, setTrimFilter, 'Filter trims...')}
          {renderSelectedPills(selectedTrims, trimFacets, toggleTrim, clearTrims)}

          {trimFacets.length === 0 ? (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>No trims available</Text>
            </View>
          ) : (
            <View style={[styles.listContainer, { 
              backgroundColor: colors.surface, 
              borderColor: colors.border 
            }]}>
              {filteredTrims.filter(t => !selectedTrims.includes(t.value)).map((trim, index, arr) => (
                <Pressable
                  key={trim.value}
                  style={({ pressed }) => [
                    styles.listItem,
                    { 
                      backgroundColor: pressed ? colors.backgroundTertiary : 'transparent',
                      borderBottomColor: colors.border,
                      borderBottomWidth: index < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                    }
                  ]}
                  onPress={() => toggleTrim(trim.value)}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.checkbox, { borderColor: colors.border }]} />
                    <Text style={[styles.listItemText, { color: colors.text }]} numberOfLines={1}>
                      {trim.label}
                    </Text>
                  </View>
                  <Text style={[styles.listItemCount, { color: colors.textTertiary }]}>
                    {trim.count?.toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
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
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 36 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.sheetContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
            <Pressable onPress={() => bottomSheetRef.current?.dismiss()} hitSlop={12}>
              <Text style={[styles.cancelBtn, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={[styles.searchInput, { 
            backgroundColor: colors.fillSecondary, 
            borderColor: colors.border 
          }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <BottomSheetTextInput
              style={[styles.searchInputText, { color: colors.text }]}
              placeholder="Search make, model, or keyword..."
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              onFocus={() => setActiveTab('search')}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <Pressable 
                onPress={() => setQuery('')} 
                hitSlop={12} 
                style={[styles.clearBtn, { backgroundColor: colors.fillSecondary }]}
              >
                <Ionicons name="close" size={12} color={colors.text} />
              </Pressable>
            )}
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
            {(['search', 'makes', 'models', 'trims'] as TabType[]).map(tab => {
              const isActive = activeTab === tab;
              const count =
                tab === 'makes' ? selectedMakes.length :
                tab === 'models' ? selectedModels.length :
                tab === 'trims' ? selectedTrims.length : 0;
              const isDisabled =
                (tab === 'models' && selectedMakes.length === 0) ||
                (tab === 'trims' && selectedModels.length === 0);

              return (
                <Pressable
                  key={tab}
                  style={[
                    styles.tab, 
                    isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
                  ]}
                  onPress={() => !isDisabled && setActiveTab(tab)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isDisabled ? colors.textTertiary : isActive ? colors.primary : colors.textSecondary,
                        fontWeight: isActive ? '600' : '500',
                      },
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {count > 0 && ` (${count})`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Scrollable Content */}
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'makes' && renderMakesTab()}
          {activeTab === 'models' && renderModelsTab()}
          {activeTab === 'trims' && renderTrimsTab()}
          <View style={{ height: 120 }} />
        </BottomSheetScrollView>

        {/* Bottom Search Button */}
        <View style={[
          styles.bottomBar, 
          { 
            paddingBottom: insets.bottom + 16, 
            backgroundColor: colors.surface, 
            borderTopColor: colors.border 
          }
        ]}>
          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              {
                backgroundColor: canSearch ? colors.primary : colors.fillSecondary,
                opacity: pressed && canSearch ? 0.9 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!canSearch}
          >
            <Ionicons 
              name="search" 
              size={18} 
              color={canSearch ? colors.primaryForeground : colors.textTertiary} 
            />
            <Text style={[
              styles.searchButtonText, 
              { color: canSearch ? colors.primaryForeground : colors.textTertiary }
            ]}>
              {hasSelections
                ? `Search ${[
                    selectedMakes.length > 0 && `${selectedMakes.length} make${selectedMakes.length > 1 ? 's' : ''}`,
                    selectedModels.length > 0 && `${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`,
                    selectedTrims.length > 0 && `${selectedTrims.length} trim${selectedTrims.length > 1 ? 's' : ''}`,
                  ].filter(Boolean).join(', ')}`
                : query.trim()
                ? `Search "${query.trim()}"`
                : 'Search'}
            </Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  cancelBtn: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  searchInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  clearLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  filterInputText: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  listContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
  },
  listItemTextSelected: {
    fontWeight: '600',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemCount: {
    fontSize: 14,
  },
  selectedSection: {
    marginBottom: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    // Color applied inline
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingSection: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
