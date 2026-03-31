/**
 * React Query Client Configuration
 * 
 * Centralized QueryClient setup with optimized defaults for mobile.
 * - Aggressive caching to reduce network calls
 * - stale-while-revalidate for instant perceived speed
 * - Error retry with exponential backoff
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 2 minutes (matches web's CDN TTL)
      staleTime: 2 * 60 * 1000,
      
      // Keep unused data in cache for 5 minutes (was 30min — too long for search results)
      gcTime: 5 * 60 * 1000,
      
      // Retry failed requests with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Refetch on window focus is handled via focusManager + AppState wiring in _layout.tsx
      refetchOnWindowFocus: true,
      
      // Refetch on mount if data is stale (past staleTime) — critical for tab switches
      refetchOnMount: true,
      
      // Refetch when network reconnects (important for mobile)
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query key factory for consistent cache keys across the app.
 * Using a factory prevents typos and enables better cache invalidation.
 */
export const queryKeys = {
  // Search/browse
  search: (params: Record<string, unknown>) => ['search', params] as const,
  searchInfinite: (params: Record<string, unknown>) => ['search', 'infinite', params] as const,
  facets: (params?: Record<string, unknown>) => ['facets', params ?? {}] as const,
  
  // Listings
  listing: (id: string) => ['listing', id] as const,
  listingDetailed: (id: string) => ['listing', 'detailed', id] as const,
  similarListings: (id: string) => ['listing', 'similar', id] as const,
  
  // Partners/Showrooms
  partners: () => ['partners'] as const,
  partner: (id: string) => ['partner', id] as const,
  showroom: (slug: string) => ['showroom', slug] as const,
  
  // Home feed
  homeGrids: () => ['home', 'grids'] as const,
  homeGrid: (type: string, id?: string) => ['home', 'grid', type, id] as const,
  
  // User data
  favorites: () => ['favorites'] as const,
  saved: () => ['saved'] as const,
  userDashboard: () => ['user', 'dashboard'] as const,
  
  // Booking
  bookingSlots: (listingId: string) => ['booking', 'slots', listingId] as const,
  
  // Messaging
  conversations: (scope?: string) => ['conversations', scope ?? 'personal'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // User data
  profile: () => ['profile'] as const,
  settings: () => ['settings'] as const,
  savedStatus: () => ['saved', 'status'] as const,
  savedListings: (type: 'favorites' | 'superlikes') => ['saved', 'listings', type] as const,
  
  // Inventory
  inventory: (filter?: string) => ['inventory', filter ?? 'all'] as const,
  inventoryStats: () => ['inventory', 'stats'] as const,
} as const;
