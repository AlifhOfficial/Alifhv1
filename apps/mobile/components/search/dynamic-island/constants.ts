/**
 * Dynamic Island - Constants
 */

import type { PricePreset, YearPreset } from './types';

// ============================================================================
// LAYOUT DIMENSIONS
// ============================================================================

export const ISLAND_CONFIG = {
  /** Height of the search bar row */
  SEARCH_ROW_HEIGHT: 56,
  /** Height of the filter pills row */
  PILLS_ROW_HEIGHT: 48,
  /** Height of the expanded dropdown area */
  DROPDOWN_HEIGHT: 340,
  /** Horizontal margin from screen edges */
  HORIZONTAL_MARGIN: 16,
  /** Border radius for the island container */
  CONTAINER_RADIUS: 24,
  /** Animation spring tension */
  SPRING_TENSION: 100,
  /** Animation spring friction */
  SPRING_FRICTION: 12,
} as const;

// ============================================================================
// FILTER PRESETS
// ============================================================================

export const PRICE_PRESETS: PricePreset[] = [
  { label: 'Under 50K', max: 50000 },
  { label: '50K - 100K', min: 50000, max: 100000 },
  { label: '100K - 200K', min: 100000, max: 200000 },
  { label: '200K+', min: 200000 },
];

export const YEAR_PRESETS: YearPreset[] = [
  { label: '2024+', min: 2024 },
  { label: '2022+', min: 2022 },
  { label: '2020+', min: 2020 },
  { label: '2015+', min: 2015 },
];

export const MILEAGE_PRESETS = [
  { label: 'Under 20K', max: 20000 },
  { label: 'Under 50K', max: 50000 },
  { label: 'Under 100K', max: 100000 },
  { label: 'Under 150K', max: 150000 },
];

export const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;

// ============================================================================
// PILL CONFIGURATION
// ============================================================================

export const PILL_ORDER = ['make', 'model', 'price', 'year', 'mileage', 'location', 'more'] as const;
