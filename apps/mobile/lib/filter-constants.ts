/**
 * Filter Constants - Mobile App
 * 
 * Re-exports all car data from the local listing-constants file.
 * Uses local copy to avoid bundling Node.js dependencies from @alifh/database.
 * 
 * SYNCED WITH: @alifh/database/listing-constants
 * 
 * @module lib/filter-constants
 */

// ============================================================================
// RE-EXPORT FROM LOCAL LISTING CONSTANTS
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
  STEERING_SIDES,
  STEERING_SIDE_VALUES,
  POWER_RANGES,
  POWER_RANGE_VALUES,
  
  // Body Options
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  
  // Colors
  EXTERIOR_COLORS,
  EXTERIOR_COLOR_VALUES,
  INTERIOR_COLORS,
  INTERIOR_COLOR_VALUES,
  
  // Location
  UAE_EMIRATES,
  
  // Status & Warranty
  EXPORT_STATUSES,
  EXPORT_STATUS_VALUES,
  WARRANTY_TYPES,
  WARRANTY_TYPE_VALUES,
  
  // Extras & Tags
  VEHICLE_EXTRAS,
  LISTING_TAGS,
  
  // Seller Types
  SELLER_TYPES,
  
  // Vehicle Condition
  VEHICLE_CONDITIONS,
  VEHICLE_CONDITION_VALUES,
  
  // Types
  type BodyType,
  type FuelType,
  type TransmissionType,
  type SpecsType,
  type ExteriorColor,
  type InteriorColor,
  type UAEEmirate,
  type SellerType,
  type VehicleCondition,
  type CarMake,
  type EngineSize,
} from './listing-constants';

// ============================================================================
// UI OPTIONS (for chips/selectors that need {value, label} format)
// ============================================================================

/**
 * Seller type options for UI components
 * SELLER_TYPES from database is just string array, so we map to UI format
 */
export const SELLER_TYPE_OPTIONS = [
  { value: 'dealer', label: 'Dealer' },
  { value: 'private', label: 'Private' },
] as const;
