/**
 * Car Listing Mutations - Barrel Export
 * 
 * Re-exports all mutation functions and types from submodules.
 * Import from this file for backwards compatibility.
 * 
 * @module queries/listings/car-listings/mutations
 */

// Types (excluding status types which are now in schema/listing-constants)
export type {
  CreateCarListingInput,
  UpdateCarListingInput,
  ListingSummary,
  ListingSummaryWithPoster,
  ListingStats,
  GetListingsByUserOptions,
  GetListingsByPartnerOptions,
  TechnicalFeatures,
  SpecialNotes,
} from './types';

// Note: ListingPostedByRole, ListingModerationStatus, ListingLifecycleStatus
// are now exported from schema/listing-constants to avoid duplication

export { CONTENT_EDIT_KEYS, MAJOR_CONTENT_EDIT_KEYS, MINOR_CONTENT_EDIT_KEYS } from './types';

// Helpers (export selectively for internal use)
export {
  addDays,
  escapeLikePattern,
  recordPriceChange,
  isListingPublic,
  makeListingId,
  makePriceHistoryId,
  DEFAULT_LISTING_EXPIRY_DAYS,
  EXTENSION_WINDOW_MS,
} from './helpers';

// Create operations
export { createCarListing } from './create';

// Update operations
export { 
  updateCarListing, 
  updateCarListingByStaff,
  reassignListingManager,
} from './update';

// Delete operations
export {
  deleteCarListing,
  deleteCarListingByStaff,
  hardDeleteCarListing,
  hardDeleteDeletedCarListingsForUser,
  checkListingOwnership,
  checkListingAccess,
} from './delete';

// Query operations
export {
  getListingsByUserId,
  getListingsByPartnerId,
  getListingStatsByUserId,
  getListingStatsByPartnerId,
} from './queries';

// Lifecycle operations
export {
  expirePublishedListingsForUser,
  expirePublishedListingsForPartner,
  extendCarListingExpiry,
  markCarListingSold,
  expireAllExpiredListings,
} from './lifecycle';

// VIN History operations (anti-abuse)
export {
  lookupVinHistory,
  recordVinPublication,
  updateVinHistoryOnDelete,
  updateVinHistoryOnSold,
  getVinPublicationStats,
  makeVinHistoryId,
  VIN_REPOST_COOLDOWN_DAYS,
  type VinHistoryLookupResult,
} from './vin-history';

// AI Valuation operations
export {
  updateListingAIValuation,
  batchUpdateListingAIValuations,
  type AIValuationUpdateInput,
} from './ai-valuation';

// AI Moderation operations
export {
  updateListingAIModeration,
  shouldSkipAIModeration,
  type AIModerationUpdateInput,
  type AIModerationResult,
} from './ai-moderation';
