/**
 * Favorites & Superlikes Hooks - Unified Single Source of Truth
 * 
 * One API endpoint, one cache, simple state management.
 * React Query handles all caching - no server-side cache duplication.
 * 
 * Main exports:
 * - useFavoritesStatus(): Get all favorites, superlikes, and quota
 * - useFavorite(id): Individual favorite operations
 * - useSuperlike(id): Individual superlike operations
 */

export { 
  useFavoritesStatus,
  useFavorite, 
  useSuperlike,
  type FavoritesStatusData 
} from './use-favorites-unified';
