/**
 * Filter Constants - Client-Side Static Data
 * 
 * Re-exports all car data from the central database package.
 * Only filter-specific additions (like sort options, popular makes) are defined here.
 * 
 * SINGLE SOURCE OF TRUTH: @alifh/database/listing-constants
 * 
 * NOTE: We import from /listing-constants directly to avoid triggering
 * database client initialization (which requires DATABASE_URL).
 * 
 * @module lib/filter-constants
 */

// ============================================================================
// RE-EXPORT FROM DATABASE PACKAGE (Single Source of Truth)
// Import directly from listing-constants to avoid DB client initialization
// ============================================================================

export {
  // Car Makes & Models
  CAR_MAKES,
  CAR_MODELS,
  getModelsForMake,
  
  // Vehicle Specs
  BODY_TYPES,
  BODY_TYPE_VALUES,
  FUEL_TYPES,
  FUEL_TYPE_VALUES,
  TRANSMISSION_TYPES,
  TRANSMISSION_TYPE_VALUES,
  ENGINE_SIZES,
  ENGINE_SIZE_VALUES,
  ENGINE_TYPES,
  ENGINE_TYPE_VALUES,
  SPECS_TYPES,
  SPECS_TYPE_VALUES,
  DRIVE_TYPES,
  STEERING_SIDES,
  STEERING_SIDE_VALUES,
  
  // Colors
  EXTERIOR_COLORS,
  EXTERIOR_COLOR_VALUES,
  INTERIOR_COLORS,
  INTERIOR_COLOR_VALUES,
  
  // Location & Status
  UAE_EMIRATES,
  VEHICLE_CONDITIONS,
  VEHICLE_CONDITION_VALUES,
  
  // Doors & Seating
  DOORS_OPTIONS,
  DOORS_VALUES,
  SEATING_OPTIONS,
  SEATING_CAPACITY_VALUES,
  
  // Types
  type BodyType,
  type FuelType,
  type TransmissionType,
  type EngineSize,
  type EngineType,
  type SpecsType,
  type ExteriorColor,
  type InteriorColor,
  type UAEEmirate,
  type CarMake,
  type VehicleCondition,
} from '@alifh/database/listing-constants';

// Import for use in helper functions
import { CAR_MAKES, EXTERIOR_COLORS, INTERIOR_COLORS } from '@alifh/database/listing-constants';

// ============================================================================
// UAE POPULAR MAKES - Show these first in dropdowns for better UX
// ============================================================================

export const UAE_POPULAR_MAKES = [
  'Toyota',
  'Nissan', 
  'Honda',
  'Hyundai',
  'Mitsubishi',
  'Ford',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Land Rover',
  'Lexus',
  'Jetour',
  'BYD',
] as const;

/**
 * Get makes sorted with popular UAE makes first
 * Useful for dropdowns where you want common choices at the top
 */
export function getMakesSortedByPopularity(): string[] {
  const popularSet = new Set<string>(UAE_POPULAR_MAKES);
  const otherMakes = (CAR_MAKES as readonly string[]).filter(make => !popularSet.has(make));
  return [...UAE_POPULAR_MAKES, '---', ...otherMakes];
}

// ============================================================================
// POPULAR MODELS - For quick search suggestions
// ============================================================================

export const UAE_POPULAR_MODELS = [
  'Land Cruiser',
  'Patrol',
  'Camry',
  'Accord',
  'Civic',
  'RAV4',
  'X5',
  'GLE',
  'Mustang',
  'Wrangler',
  'Range Rover',
  'Cayenne',
  '911',
  'Model 3',
  'Model Y',
] as const;

// ============================================================================
// POPULAR MAKES FOR HOME BROWSE
// ============================================================================

export const HOME_POPULAR_MAKES = [
  'Toyota',
  'BMW',
  'Mercedes-Benz',
  'Porsche',
  'Land Rover',
  'Audi',
  'Nissan',
  'Lexus',
  'Kia',
  'Volkswagen',
  'Jeep',
] as const;

// ============================================================================
// SORT OPTIONS (Filter-specific)
// ============================================================================

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'year_new', label: 'Year: Newest' },
  { value: 'year_old', label: 'Year: Oldest' },
  { value: 'mileage_low', label: 'Mileage: Low to High' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get color hex value */
export function getColorHex(color: string, type: 'exterior' | 'interior' = 'exterior'): string {
  const colors = type === 'exterior' ? EXTERIOR_COLORS : INTERIOR_COLORS;
  return colors.find((c) => c.value === color)?.hex ?? '#CCCCCC';
}

/** Get label for a value from an options array */
export function getLabel<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string {
  return options.find(o => o.value === value)?.label ?? value;
}
