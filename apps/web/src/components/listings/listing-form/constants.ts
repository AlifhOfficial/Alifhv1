/**
 * Listing Form Constants - Client-Safe
 * 
 * Re-exports constants from database package for use in client components.
 * 
 * ⚠️ IMPORT PATTERN:
 * - TYPE imports: Can use '@alifh/database' (tree-shakeable, no runtime)
 * - VALUE imports: Must use direct path '@alifh/database/src/...' (avoids dbclient)
 * 
 * SINGLE SOURCE OF TRUTH: packages/database/src/schema/listing-constants.ts
 * Add new brands, models, colors, etc. in the database package, not here.
 * 
 * @module components/listings/listing-form/constants
 */

// ✅ Direct import from file to avoid pulling in dbclient (which requires DATABASE_URL)
export {
  // Status enums (for admin/moderation)
  LISTING_MODERATION_STATUSES,
  LISTING_LIFECYCLE_STATUSES,
  LISTING_POSTED_BY_ROLES,
  SELLER_TYPES,
  VEHICLE_CONDITIONS,
  // Car data
  CAR_MAKES,
  CAR_MODELS,
  // Specifications
  ENGINE_SIZES,
  ENGINE_TYPES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  STEERING_SIDES,
  EXPORT_STATUSES,
  WARRANTY_TYPES,
  POWER_RANGES,
  // Appearance
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  // Location
  UAE_EMIRATES,
  // Features & Tags
  VEHICLE_EXTRAS,
  LISTING_TAGS,
  // Limits
  MAX_LISTING_TAGS,
  MAX_SPECIAL_NOTES,
  MAX_SPECIAL_NOTE_LENGTH,
  // Helper functions
  getModelsForMake,
  isValidMakeModelCombo,
  getEnumLabel,
} from '@alifh/database/listing-constants';

// ✅ Type-only imports can use main package (tree-shaken at build time)
export type { 
  CarMake,
  ListingModerationStatus,
  ListingLifecycleStatus,
  ListingPostedByRole,
  SellerType,
  EngineSize,
  EngineType,
  BodyType,
  FuelType,
  TransmissionType,
  SpecsType,
  SteeringSide,
  ExportStatus,
  WarrantyType,
  PowerRange,
  ExteriorColor,
  InteriorColor,
  DoorsOption,
  SeatingOption,
  UAEEmirate,
  VehicleExtra,
} from '@alifh/database/listing-constants';
