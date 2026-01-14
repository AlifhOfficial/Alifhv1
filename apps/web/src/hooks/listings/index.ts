/**
 * Listings Hooks - Centralized Exports
 * 
 * React Query hooks for listing management operations.
 * Provides caching, optimistic updates, and consistent state.
 */

// Query hooks
export {
  useMyListings,
  usePartnerListings,
} from './use-my-listings';

export type {
  ListingType,
  ModerationStatus,
  LifecycleStatus,
  ListingsSort,
  LegacyStatus,
  ListingData,
  ListingStats,
  ListingsResponse,
  UseMyListingsOptions,
  UsePartnerListingsOptions,
} from './use-my-listings';

// Detail hook
export {
  useListingDetail,
} from './use-listing-detail';

export type {
  PartnerSellerData,
  UserSellerData,
  SellerData,
  ListingDetailResponse,
  UseListingDetailOptions,
} from './use-listing-detail';

// Seller stats hook (lazy loaded)
export {
  useSellerStats,
} from './use-seller-stats';

export type {
  PartnerStats,
  UserStats,
  SellerStats,
} from './use-seller-stats';

// Mutation hooks
export {
  useDeleteListing,
  useExtendListing,
  useMarkSold,
  useArchiveListing,
  useUnarchiveListing,
  useListingActions,
} from './use-listing-mutations';

export type {
  UpdateListingInput,
  DeleteListingResult,
  ExtendListingResult,
  MarkSoldResult,
  ArchiveResult,
} from './use-listing-mutations';

// Analytics hooks
export {
  useTrackView,
  useTrackImpressions,
} from './use-listing-analytics';
