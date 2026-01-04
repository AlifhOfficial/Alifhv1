/**
 * Cache Configuration - Standardized
 * 
 * Centralized cache durations and settings for consistency across the app.
 * Every developer MUST use these constants - no more random values.
 * 
 * @module lib/cache-config
 */

// ============================================================================
// STALE TIME CONSTANTS (React Query)
// ============================================================================

/**
 * How long cached data is considered "fresh" before refetching.
 * 
 * RULE: Pick based on data volatility, not convenience
 * - Real-time data (messages, unread counts) = SHORT
 * - User-generated content (profiles, listings) = MEDIUM
 * - Static/computed data (stats, aggregates) = LONG
 */
export const CACHE_STALE_TIME = {
  /**
   * 10 seconds - Real-time data
   * Use for: Autocomplete, search suggestions, typing indicators
   */
  REALTIME: 10 * 1000,

  /**
   * 30 seconds - Frequently changing data
   * Use for: Favorites, engagement metrics, request status, notifications
   */
  SHORT: 30 * 1000,

  /**
   * 1 minute - Default for most queries
   * Use for: General listings, unread counts, dashboard data
   */
  DEFAULT: 60 * 1000,

  /**
   * 2 minutes - Moderate volatility
   * Use for: Listing details, user activity feeds
   */
  MEDIUM: 2 * 60 * 1000,

  /**
   * 5 minutes - Low volatility, expensive queries
   * Use for: Stats, aggregates, conversations, messages, partner metrics
   */
  LONG: 5 * 60 * 1000,

  /**
   * 15 minutes - Very stable data
   * Use for: Configuration, app settings, tier info
   */
  VERY_LONG: 15 * 60 * 1000,

  /**
   * 1 hour - Rarely changes, profile data
   * Use for: User profiles (firstName, lastName rarely change)
   * WARNING: Only use when you have reliable invalidation on mutations
   */
  STATIC: 60 * 60 * 1000,

  /**
   * Infinity - Never refetch automatically
   * Use for: One-time fetches, wizard data, form state
   * CAUTION: Must manually invalidate when data changes
   */
  INFINITE: Infinity,
} as const;

// ============================================================================
// REFETCH INTERVALS (Background Updates)
// ============================================================================

/**
 * How often to automatically refetch data in the background.
 * 
 * RULE: Only use for critical real-time features
 * - Most queries should NOT use refetchInterval (rely on manual invalidation)
 * - Use sparingly - polling is expensive
 */
export const CACHE_REFETCH_INTERVAL = {
  /**
   * 30 seconds - High priority real-time
   * Use for: Unread message counts (when WebSocket not available)
   */
  HIGH: 30 * 1000,

  /**
   * 1 minute - Moderate priority real-time
   * Use for: Notification badges, activity feeds
   */
  MEDIUM: 60 * 1000,

  /**
   * 2 minutes - Low priority background sync
   * Use for: Unread counts (with WebSocket fallback)
   */
  LOW: 2 * 60 * 1000,

  /**
   * 5 minutes - Very low priority
   * Use for: Non-critical metrics, dashboard stats
   */
  VERY_LOW: 5 * 60 * 1000,

  /**
   * Disabled - No automatic refetching
   * Default for most queries - use manual invalidation instead
   */
  DISABLED: false,
} as const;

// ============================================================================
// MEMORY CACHE TTL (Server-Side)
// ============================================================================

/**
 * Time-to-live for server-side memory cache entries.
 * 
 * RULE: Match to data stability and invalidation strategy
 * - If you can invalidate reliably = use longer TTL
 * - If invalidation is tricky = use shorter TTL
 */
export const MEMORY_CACHE_TTL = {
  /**
   * 30 seconds - Frequently changing
   * Use for: User favorites, engagement counts
   */
  SHORT: 30,

  /**
   * 1 minute - Default
   * Use for: Session data, auth checks
   */
  DEFAULT: 60,

  /**
   * 5 minutes - Stable data
   * Use for: Listing details, user profiles
   */
  MEDIUM: 5 * 60,

  /**
   * 15 minutes - Very stable
   * Use for: Partner profiles, dealer info
   */
  LONG: 15 * 60,

  /**
   * 1 hour - Rarely changes
   * Use for: Configuration, static content
   */
  VERY_LONG: 60 * 60,
} as const;

// ============================================================================
// API ROUTE CACHE-CONTROL HEADERS
// ============================================================================

/**
 * Standardized Cache-Control headers for API routes.
 * 
 * RULE: Choose based on data sensitivity and sharing
 * - User-specific data = PRIVATE
 * - Public data = PUBLIC with appropriate max-age
 * - Sensitive operations = NO_CACHE
 */
export const API_CACHE_HEADERS = {
  /**
   * No caching - Always fresh
   * Use for: Mutations, auth operations, sensitive data
   */
  NO_CACHE: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  },

  /**
   * Alias for NO_CACHE - Use when you want to be explicit about no-store
   */
  NO_STORE: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  },

  /**
   * Private cache - 1 minute
   * Use for: User-specific reads (favorites, bookings)
   */
  PRIVATE_SHORT: {
    'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
  },

  /**
   * Private cache - 5 minutes
   * Use for: User dashboard data, settings
   */
  PRIVATE_MEDIUM: {
    'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
  },

  /**
   * Private cache - 1 hour
   * Use for: User profiles (with manual invalidation)
   */
  PRIVATE_LONG: {
    'Cache-Control': 'private, max-age=3600, stale-while-revalidate=1800',
  },

  /**
   * Private cache - 2 hours
   * Use for: Lead funnels, saved searches (with manual sync button)
   */
  PRIVATE_ULTRA_LONG: {
    'Cache-Control': 'private, max-age=7200, stale-while-revalidate=3600',
  },

  /**
   * Public cache - 30 seconds
   * Use for: Public listings, search results
   */
  PUBLIC_SHORT: {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
  },

  /**
   * Public cache - 1 minute
   * Use for: Partner profiles, dealer info
   */
  PUBLIC_MEDIUM: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  },

  /**
   * Public cache - 5 minutes
   * Use for: Static content, rarely changing data
   */
  PUBLIC_LONG: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },

  /**
   * CDN bypass - User-specific
   * Use for: Personalized data that shouldn't hit CDN
   */
  CDN_BYPASS: {
    revalidate: 0,
    headers: {
      'Cache-Control': 'private, no-cache',
    },
  },
} as const;

// ============================================================================
// CACHE BEHAVIOR FLAGS
// ============================================================================

/**
 * Common query behavior presets.
 * 
 * Use these for consistent behavior across similar query types.
 */
export const CACHE_BEHAVIORS = {
  /**
   * Real-time data - aggressive refetching
   */
  REALTIME: {
    staleTime: CACHE_STALE_TIME.REALTIME,
    refetchInterval: CACHE_REFETCH_INTERVAL.HIGH,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  /**
   * User data - moderate caching with focus refetch
   */
  USER_DATA: {
    staleTime: CACHE_STALE_TIME.DEFAULT,
    refetchInterval: CACHE_REFETCH_INTERVAL.DISABLED,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
  },

  /**
   * Content data - longer cache, no automatic refetch
   */
  CONTENT: {
    staleTime: CACHE_STALE_TIME.MEDIUM,
    refetchInterval: CACHE_REFETCH_INTERVAL.DISABLED,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  /**
   * Expensive queries - long cache, manual invalidation only
   */
  EXPENSIVE: {
    staleTime: CACHE_STALE_TIME.LONG,
    refetchInterval: CACHE_REFETCH_INTERVAL.DISABLED,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  /**
   * Profile data - very long cache, never auto-refetch
   */
  PROFILE: {
    staleTime: CACHE_STALE_TIME.STATIC,
    refetchInterval: CACHE_REFETCH_INTERVAL.DISABLED,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  /**
   * Static data - infinite cache
   */
  STATIC: {
    staleTime: CACHE_STALE_TIME.INFINITE,
    refetchInterval: CACHE_REFETCH_INTERVAL.DISABLED,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: User profile hook
 * 
 * ```typescript
 * const { data } = useQuery({
 *   queryKey: queryKeys.user.profile(),
 *   queryFn: fetchProfile,
 *   ...CACHE_BEHAVIORS.PROFILE, // 1 hour cache, no refetch
 * });
 * ```
 */

/**
 * EXAMPLE 2: Listing detail
 * 
 * ```typescript
 * const { data } = useQuery({
 *   queryKey: queryKeys.listing.detail(id),
 *   queryFn: () => fetchListing(id),
 *   staleTime: CACHE_STALE_TIME.MEDIUM, // 2 minutes
 * });
 * ```
 */

/**
 * EXAMPLE 3: Unread count with polling
 * 
 * ```typescript
 * const { data } = useQuery({
 *   queryKey: queryKeys.messaging.unreadCount(),
 *   queryFn: fetchUnreadCount,
 *   ...CACHE_BEHAVIORS.REALTIME, // 10s stale, 30s polling
 * });
 * ```
 */

/**
 * EXAMPLE 4: API route
 * 
 * ```typescript
 * export async function GET() {
 *   const data = await fetchUserProfile();
 *   return NextResponse.json(data, {
 *     headers: API_CACHE_HEADERS.PRIVATE_LONG,
 *   });
 * }
 * ```
 */
