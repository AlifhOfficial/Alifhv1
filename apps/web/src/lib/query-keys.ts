/**
 * Query Keys Factory - Type-Safe and Consistent
 * 
 * Centralized query key generation for React Query.
 * 
 * BENEFITS:
 * - Type safety - autocomplete and validation
 * - Consistency - same pattern everywhere
 * - Easy invalidation - invalidate whole families
 * - Discoverability - see all query keys in one place
 * 
 * STRUCTURE:
 * - Top level = feature domain (user, listing, messaging, etc.)
 * - Second level = specific query type (profile, detail, list, etc.)
 * - Parameters = passed as arguments, appended to array
 * 
 * INVALIDATION EXAMPLES:
 * - Invalidate all user queries: queryKeys.user.all
 * - Invalidate all listings: queryKeys.listing.all
 * - Invalidate specific listing: queryKeys.listing.detail(id)
 * 
 * @module lib/query-keys
 */

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

export const queryKeys = {
  // ==========================================================================
  // USER DOMAIN
  // ==========================================================================
  user: {
    /**
     * Invalidate ALL user queries
     * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
     */
    all: ['user'] as const,

    /**
     * User profile (firstName, lastName, avatar, etc.)
     * Cached for 1 hour - invalidate on profile updates
     */
    profile: () => [...queryKeys.user.all, 'profile'] as const,

    /**
     * User statistics (listings count, favorites count, etc.)
     * Cached for 5 minutes - expensive aggregation
     */
    stats: () => [...queryKeys.user.all, 'stats'] as const,

    /**
     * Staff invites for current user
     * Cached for 30 seconds - moderate volatility
     */
    staffInvites: () => [...queryKeys.user.all, 'staff-invites'] as const,
  },

  // ==========================================================================
  // LISTING DOMAIN
  // ==========================================================================
  listing: {
    /**
     * Invalidate ALL listing queries
     */
    all: ['listing'] as const,

    /**
     * Single listing detail
     * @param id - Listing ID
     */
    detail: (id: string) => [...queryKeys.listing.all, 'detail', id] as const,

    /**
     * User's own listings
     * @param options - Filter options (status, pagination, etc.)
     */
    myListings: (options?: Record<string, any>) =>
      [...queryKeys.listing.all, 'my-listings', options] as const,

    /**
     * Partner inventory listings
     * @param partnerId - Partner ID
     * @param status - Optional status filter
     */
    partnerInventory: (partnerId: string, status?: string) =>
      [...queryKeys.listing.all, 'partner-inventory', partnerId, status] as const,
  },

  // ==========================================================================
  // MESSAGING DOMAIN
  // ==========================================================================
  messaging: {
    /**
     * Invalidate ALL messaging queries
     */
    all: ['messaging'] as const,

    /**
     * Unread message count
     */
    unreadCount: () => [...queryKeys.messaging.all, 'unread-count'] as const,

    /**
     * Conversation list
     * @param options - Scope (personal/staff) and filters
     */
    conversations: (options?: { scope?: 'personal' | 'staff'; userId?: string }) =>
      [...queryKeys.messaging.all, 'conversations', options] as const,

    /**
     * Messages in a conversation
     * @param conversationId - Conversation ID
     */
    messages: (conversationId: string) =>
      [...queryKeys.messaging.all, 'messages', conversationId] as const,
  },

  // ==========================================================================
  // PARTNER DOMAIN
  // ==========================================================================
  partner: {
    /**
     * Invalidate ALL partner queries
     */
    all: ['partner'] as const,

    /**
     * Partner request (user's application to become partner)
     */
    request: () => [...queryKeys.partner.all, 'request'] as const,

    /**
     * Partner profile (dealer info)
     * @param partnerId - Partner ID
     */
    profile: (partnerId: string) => [...queryKeys.partner.all, 'profile', partnerId] as const,

    /**
     * Partner statistics
     * @param partnerId - Partner ID
     */
    stats: (partnerId: string) => [...queryKeys.partner.all, 'stats', partnerId] as const,

    /**
     * Partner billing (subscription + invoices)
     * Cached for 6 hours - changes once a month
     * @param partnerId - Partner ID
     */
    billing: (partnerId: string) => [...queryKeys.partner.all, 'billing', partnerId] as const,
  },

  // ==========================================================================
  // STAFF DOMAIN
  // ==========================================================================
  staff: {
    /**
     * Invalidate ALL staff queries
     */
    all: ['staff'] as const,

    /**
     * Staff member profile
     */
    profile: () => [...queryKeys.staff.all, 'profile'] as const,

    /**
     * Staff team management
     */
    team: () => [...queryKeys.staff.all, 'team'] as const,

    /**
     * Staff overview/dashboard
     */
    overview: () => [...queryKeys.staff.all, 'overview'] as const,
  },

  // ==========================================================================
  // ADMIN DOMAIN
  // ==========================================================================
  admin: {
    /**
     * Invalidate ALL admin queries
     */
    all: ['admin'] as const,

    /**
     * Users list with filters
     * @param options - Pagination, filters, search
     */
    usersList: (options?: Record<string, any>) =>
      [...queryKeys.admin.all, 'users-list', options] as const,

    /**
     * User search (autocomplete)
     * @param search - Search parameters (email, phone, query)
     */
    userSearch: (search?: Record<string, any>) =>
      [...queryKeys.admin.all, 'user-search', search] as const,

    /**
     * Partners list
     * @param options - Filters
     */
    partnersList: (options?: Record<string, any>) =>
      [...queryKeys.admin.all, 'partners-list', options] as const,

    /**
     * Admin statistics
     */
    stats: () => [...queryKeys.admin.all, 'stats'] as const,

    /**
     * Ban appeals
     */
    banAppeals: () => [...queryKeys.admin.all, 'ban-appeals'] as const,

    /**
     * Partner requests (admin view)
     */
    partnerRequests: () => [...queryKeys.admin.all, 'partner-requests'] as const,

    /**
     * Partner request detail
     * @param requestId - Request ID
     */
    partnerRequest: (requestId: string) =>
      [...queryKeys.admin.all, 'partner-request', requestId] as const,

    /**
     * Partner request counts
     */
    partnerRequestCounts: () => [...queryKeys.admin.all, 'partner-request-counts'] as const,
  },

  // ==========================================================================
  // ENGAGEMENT DOMAIN
  // ==========================================================================
  engagement: {
    /**
     * Invalidate ALL engagement queries
     */
    all: ['engagement'] as const,

    /**
     * Favorites status (which listings are favorited)
     */
    favoritesStatus: () => [...queryKeys.engagement.all, 'favorites-status'] as const,

    /**
     * User's favorite listings
     */
    favorites: () => [...queryKeys.engagement.all, 'favorites'] as const,
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Extract query key types for type-safe usage
 */
export type UserQueryKey = 
  | ReturnType<typeof queryKeys.user.profile>
  | ReturnType<typeof queryKeys.user.stats>
  | ReturnType<typeof queryKeys.user.staffInvites>;

export type ListingQueryKey = 
  | ReturnType<typeof queryKeys.listing.detail>
  | ReturnType<typeof queryKeys.listing.myListings>
  | ReturnType<typeof queryKeys.listing.partnerInventory>;

export type MessagingQueryKey = 
  | ReturnType<typeof queryKeys.messaging.unreadCount>
  | ReturnType<typeof queryKeys.messaging.conversations>
  | ReturnType<typeof queryKeys.messaging.messages>;

export type PartnerQueryKey = 
  | ReturnType<typeof queryKeys.partner.request>
  | ReturnType<typeof queryKeys.partner.profile>
  | ReturnType<typeof queryKeys.partner.stats>;

export type StaffQueryKey = 
  | ReturnType<typeof queryKeys.staff.profile>
  | ReturnType<typeof queryKeys.staff.team>
  | ReturnType<typeof queryKeys.staff.overview>;

export type AdminQueryKey = 
  | ReturnType<typeof queryKeys.admin.usersList>
  | ReturnType<typeof queryKeys.admin.userSearch>
  | ReturnType<typeof queryKeys.admin.partnersList>
  | ReturnType<typeof queryKeys.admin.stats>
  | ReturnType<typeof queryKeys.admin.banAppeals>
  | ReturnType<typeof queryKeys.admin.partnerRequests>
  | ReturnType<typeof queryKeys.admin.partnerRequest>
  | ReturnType<typeof queryKeys.admin.partnerRequestCounts>;

export type EngagementQueryKey = 
  | ReturnType<typeof queryKeys.engagement.favoritesStatus>
  | ReturnType<typeof queryKeys.engagement.favorites>;

/**
 * Union of all possible query keys
 */
export type QueryKey = 
  | UserQueryKey
  | ListingQueryKey
  | MessagingQueryKey
  | PartnerQueryKey
  | StaffQueryKey
  | AdminQueryKey
  | EngagementQueryKey;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Using in a hook
 * 
 * ```typescript
 * const { data } = useQuery({
 *   queryKey: queryKeys.user.profile(),
 *   queryFn: fetchProfile,
 * });
 * ```
 */

/**
 * EXAMPLE 2: Invalidating specific query
 * 
 * ```typescript
 * queryClient.invalidateQueries({ 
 *   queryKey: queryKeys.user.profile() 
 * });
 * ```
 */

/**
 * EXAMPLE 3: Invalidating all user queries
 * 
 * ```typescript
 * queryClient.invalidateQueries({ 
 *   queryKey: queryKeys.user.all 
 * });
 * ```
 */

/**
 * EXAMPLE 4: Invalidating by prefix (all listings)
 * 
 * ```typescript
 * queryClient.invalidateQueries({ 
 *   queryKey: queryKeys.listing.all 
 * });
 * ```
 */

/**
 * EXAMPLE 5: With parameters
 * 
 * ```typescript
 * const { data } = useQuery({
 *   queryKey: queryKeys.listing.detail(listingId),
 *   queryFn: () => fetchListing(listingId),
 * });
 * ```
 */

/**
 * EXAMPLE 6: Multiple invalidations after mutation
 * 
 * ```typescript
 * onSuccess: () => {
 *   queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
 *   queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() });
 * }
 * ```
 */

/**
 * MIGRATION GUIDE:
 * 
 * OLD:
 * queryKey: ['user-profile']
 * queryKey: ['listing', 'detail', id]
 * queryKey: ['admin', 'ban-appeals']
 * 
 * NEW:
 * queryKey: queryKeys.user.profile()
 * queryKey: queryKeys.listing.detail(id)
 * queryKey: queryKeys.admin.banAppeals()
 */
