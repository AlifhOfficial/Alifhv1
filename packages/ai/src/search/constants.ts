/**
 * Re-export listing constants from the database package.
 *
 * We use a direct relative path instead of the package name so that
 * Turbopack (Next.js) can resolve the module without needing the full
 * @alifh/database dependency graph.
 */
export {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  UAE_EMIRATES,
  VEHICLE_EXTRAS,
  LISTING_TAGS,
} from '../../../database/src/schema/listing-constants';
