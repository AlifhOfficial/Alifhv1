/**
 * Favorites & Superlikes Hooks - Single Source of Truth
 * 
 * Completely separated implementations:
 * - Favorites: use-favorites-simple.ts
 * - Superlikes: use-superlikes-simple.ts
 * 
 * Each feature has its own cache, mutations, and API routes.
 * No shared state - prevents cross-contamination.
 */

// Favorites exports
export { useFavorite, useFavoritesOnly } from './use-favorites-simple';

// Superlikes exports
export { 
  useSuperlike, 
  useSuperlikesOnly, 
  useSuperlikeQuota,
  type SuperlikeQuota 
} from './use-superlikes-simple';
