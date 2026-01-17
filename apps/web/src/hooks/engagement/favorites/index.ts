/**
 * Favorites & Superlikes Hooks - Unified Single Source of Truth
 * 
 * One API endpoint, one cache, simple state management.
 * React Query handles all caching - no server-side cache duplication.
 * 
 * Main exports:
 * - useFavoritesStatus(): Get all favorites, superlikes, and quota (IDs only)
 * - useFavoritesListings(): Get favorites with full listing data
 * - useSuperlikesListings(): Get superlikes with full listing data
 * - useFavorite(id): Individual favorite operations
 * - useSuperlike(id): Individual superlike operations
 */

export { 
  useFavoritesStatus,
  useFavoritesListings,
  useSuperlikesListings,
  useFavorite, 
  useSuperlike,
  type FavoritesStatusData,
  type ListingCardData,
} from './use-favorites-unified';
