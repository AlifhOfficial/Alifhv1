/**
 * Dynamic Island - Utility Functions
 */

import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// PRICE FORMATTING
// ============================================================================

export function formatPrice(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toString();
}

export function formatPriceRange(min?: number, max?: number): string {
  if (min && max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }
  if (min) return `${formatPrice(min)}+`;
  if (max) return `Under ${formatPrice(max)}`;
  return 'Price';
}

// ============================================================================
// YEAR FORMATTING
// ============================================================================

export function formatYearRange(min?: number, max?: number): string {
  if (min && max) {
    return `${min} - ${max}`;
  }
  if (min) return `${min}+`;
  if (max) return `Until ${max}`;
  return 'Year';
}

// ============================================================================
// MILEAGE FORMATTING
// ============================================================================

export function formatMileage(value: number): string {
  if (value >= 1000) {
    return `Under ${Math.round(value / 1000)}K km`;
  }
  return `Under ${value} km`;
}

// ============================================================================
// SUGGESTION HELPERS
// ============================================================================

export function getSuggestionIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'make':
      return 'car-sport-outline';
    case 'model':
    case 'make_model':
    case 'make_model_trim':
      return 'car-outline';
    case 'partner':
      return 'business-outline';
    default:
      return 'search-outline';
  }
}

export function formatSuggestionType(type: string): string {
  switch (type) {
    case 'make':
      return 'Brand';
    case 'model':
      return 'Model';
    case 'make_model':
      return 'Make & Model';
    case 'make_model_trim':
      return 'Trim';
    case 'partner':
      return 'Dealer';
    default:
      return '';
  }
}
