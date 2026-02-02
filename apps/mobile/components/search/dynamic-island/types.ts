/**
 * Dynamic Island - Type Definitions
 */

import type { Colors } from '@/constants/theme';
import type { SearchFacets, Suggestion } from '@/lib/api';

// ============================================================================
// THEME TYPE
// ============================================================================

export type ThemeColors = typeof Colors.light;

// ============================================================================
// FILTER TYPES
// ============================================================================

export type ActivePill = 'search' | 'make' | 'model' | 'price' | 'year' | 'mileage' | 'location' | 'more' | null;

export interface Filters {
  make?: string[];
  model?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  emirate?: string[];
  condition?: 'new' | 'used';
  isBlkListing?: boolean;
  isBlackTierPartner?: boolean;
  isNegotiable?: boolean;
  specs?: string[];
  [key: string]: string | number | string[] | boolean | undefined;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface DynamicIslandProps {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  suggestions: Suggestion[];
  loadingSuggestions: boolean;
  onSuggestionPress: (suggestion: Suggestion) => void;
  // Pills & Filters
  activePill: ActivePill;
  onActivePillChange: (pill: ActivePill) => void;
  facets?: SearchFacets;
  filters: Filters;
  onFilterSelect: (key: string, value: any) => void;
  // Advanced Filters
  onFilterPress: () => void;
  hasActiveFilters: boolean;
  // Theme
  colors: ThemeColors;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isExpanded: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

export interface FilterPillProps {
  label: string;
  hasValue: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onClear: () => void;
  colors: ThemeColors;
}

export interface FilterPillsRowProps {
  filters: Filters;
  activePill: ActivePill;
  onPillPress: (pill: ActivePill) => void;
  onClearFilter: (key: string, additionalKey?: string) => void;
  getPillLabel: (pill: ActivePill) => string;
  isPillActive: (pill: ActivePill) => boolean;
  colors: ThemeColors;
}

export interface DropdownProps {
  colors: ThemeColors;
}

export interface SearchDropdownProps extends DropdownProps {
  suggestions: Suggestion[];
  loading: boolean;
  searchValue: string;
  onSuggestionPress: (suggestion: Suggestion) => void;
}

export interface OptionDropdownProps extends DropdownProps {
  options: Array<{ value: string; count: number }>;
  selectedValues?: string[];
  onToggle: (values: string[]) => void;
  onClear: () => void;
  searchPlaceholder: string;
  emptyMessage?: string;
}

export interface PresetDropdownProps extends DropdownProps {
  presets: Array<{ label: string; min?: number; max?: number }>;
  currentMin?: number;
  currentMax?: number;
  onSelect: (min?: number, max?: number) => void;
  onClear: () => void;
  title: string;
  clearLabel: string;
}

// ============================================================================
// PRESETS
// ============================================================================

export interface PricePreset {
  label: string;
  min?: number;
  max?: number;
}

export interface YearPreset {
  label: string;
  min?: number;
  max?: number;
}
