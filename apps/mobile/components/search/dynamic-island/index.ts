/**
 * Dynamic Island - Barrel Export
 */

// Main Component
export { DynamicIsland } from './DynamicIsland';

// Sub-components (for advanced customization)
export { SearchBar } from './SearchBar';
export { FilterPill } from './FilterPill';
export { FilterPillsRow } from './FilterPillsRow';
export { SearchDropdown, OptionDropdown, PresetDropdown } from './dropdowns';

// Types
export type {
  ActivePill,
  Filters,
  DynamicIslandProps,
  ThemeColors,
  FilterPillProps,
  SearchBarProps,
} from './types';

// Constants & Utils
export { ISLAND_CONFIG, PRICE_PRESETS, YEAR_PRESETS, EMIRATES } from './constants';
export { formatPrice, formatPriceRange, formatYearRange } from './utils';
