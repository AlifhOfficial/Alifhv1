/**
 * Favorites Hook
 * 
 * Re-export from use-favorites-query.ts for backward compatibility.
 * Now uses React Query instead of context for automatic cache management.
 */

'use client';

export { useFavorites, useFavoritesQuery, useQuotaQuery } from './use-favorites-query';
export type { FavoriteStatus, SuperlikeQuota } from './use-favorites-query';
