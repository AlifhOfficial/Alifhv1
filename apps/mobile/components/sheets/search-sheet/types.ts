/**
 * SearchSheet Types
 * Shared type definitions for search sheet components
 */

import type { Suggestion, FacetBucket, SearchFacets } from '@/lib/search-api';
import type { ThemeColors } from '@/constants/theme';

export type TabType = 'search' | 'makes' | 'models' | 'trims';

// Base props that all themed components receive
export interface ThemedComponentProps {
  colors: ThemeColors;
}

export interface SearchSheetProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (params: SearchParams) => void;
}

export interface SearchParams {
  q?: string;
  make?: string[];
  model?: string[];
  trim?: string[];
}

export interface SearchSheetState {
  // Search
  query: string;
  suggestions: Suggestion[];
  popularMakes: Suggestion[];
  isLoading: boolean;
  isFetchingPopular: boolean;
  
  // Multi-select
  activeTab: TabType;
  selectedMakes: string[];
  selectedModels: string[];
  selectedTrims: string[];
  
  // Facets
  facets: SearchFacets | null;
  modelFacets: FacetBucket[];
  trimFacets: FacetBucket[];
  isFetchingFacets: boolean;
  
  // Filters
  makeFilter: string;
  modelFilter: string;
  trimFilter: string;
}

export interface SearchSheetActions {
  setQuery: (query: string) => void;
  setActiveTab: (tab: TabType) => void;
  toggleMake: (value: string) => void;
  toggleModel: (value: string) => void;
  toggleTrim: (value: string) => void;
  clearMakes: () => void;
  clearModels: () => void;
  clearTrims: () => void;
  setMakeFilter: (filter: string) => void;
  setModelFilter: (filter: string) => void;
  setTrimFilter: (filter: string) => void;
  handleSuggestionPress: (suggestion: Suggestion) => void;
  handleSubmit: () => void;
}

export type { Suggestion, FacetBucket, SearchFacets };
