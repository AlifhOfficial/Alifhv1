/**
 * API: My Listings
 * GET /api/listings/my-listings
 * 
 * Purpose: Get all listings for the authenticated user
 * Authentication: Required
 * Session Source: getSessionUser() from middleware cache
 * 
 * Query Params:
 * - status: Legacy overall filter ('published'|'pending'|'draft'|'archived'|'sold'|'expired'|...)
 * - moderationStatus: Filter by moderation dimension
 * - lifecycleStatus: Filter by lifecycle dimension
 * - listingType: Filter by type ('personal' | 'work') - personal = no partnerId, work = has partnerId
 * - staffMemberUserId: For work listings, filter to show only listings created by this staff member
 * - limit: Results per page (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  expirePublishedListingsForPartner,
  expirePublishedListingsForUser,
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  getListingStatsByPartnerId,
  getListingStatsByUserId,
  getListingsByPartnerId,
  getListingsByUserId,
  memoryCache,
} from '@alifh/database';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_GENERAL,
} from '@/lib/rate-limit';

const myListingsLimiter = createRateLimiter(RATE_LIMITS_GENERAL.READ_AUTH);

export const runtime = 'nodejs';

const EXPIRY_MAINTENANCE_TTL_SECONDS = 300;
const LISTING_STATS_TTL_SECONDS = 15;

// Debug flag: set DEBUG_LISTING_TIMING=true to log performance timings
const DEBUG_TIMING = process.env.DEBUG_LISTING_TIMING === 'true';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  const logTiming = (label: string) => {
    if (DEBUG_TIMING) {
      console.log(`[my-listings] ${label}: ${(performance.now() - startTime).toFixed(0)}ms`);
    }
  };
  
  try {
    // Auth check - must be authenticated
    const user = await getSessionUser();
    logTiming('auth');
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await myListingsLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }
    logTiming('rate-limit');

    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status') || undefined;
    const moderationStatus = (searchParams.get('moderationStatus') || undefined) as any;
    const lifecycleStatus = (searchParams.get('lifecycleStatus') || undefined) as any;
    const listingType = searchParams.get('listingType') as 'personal' | 'work' | undefined;
    const staffMemberUserId = searchParams.get('staffMemberUserId') || undefined;
    const q = searchParams.get('q') || undefined;
    const sort = (searchParams.get('sort') || undefined) as any;
    const includeStats = searchParams.get('includeStats') === '1' || searchParams.get('includeStats') === 'true';
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate status if provided
    const validLegacyStatuses = [
      'all',
      'public',
      'published',
      'pending',
      'draft',
      'approved',
      'rejected',
      'active',
      'archived',
      'suspended',
      'sold',
      'expired',
      'deleted',
      'deep_inventory', // Combined view for archived + suspended + sold + expired + deleted
      'in_review', // Alias for pending
    ];
    if (status && !validLegacyStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status',
          validValues: validLegacyStatuses
        },
        { status: 400 }
      );
    }

    const validModerationStatuses = ['draft', 'submitted', 'pending_review', 'approved', 'rejected'];
    if (moderationStatus && !validModerationStatuses.includes(moderationStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid moderationStatus',
          validValues: validModerationStatuses,
        },
        { status: 400 }
      );
    }

    const validLifecycleStatuses = ['active', 'archived', 'sold', 'expired', 'deleted'];
    if (lifecycleStatus && !validLifecycleStatuses.includes(lifecycleStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid lifecycleStatus',
          validValues: validLifecycleStatuses,
        },
        { status: 400 }
      );
    }

    const validSorts = ['newest', 'oldest', 'updated', 'expiring'];
    if (sort && !validSorts.includes(sort)) {
      return NextResponse.json(
        {
          error: 'Invalid sort',
          validValues: validSorts,
        },
        { status: 400 }
      );
    }

    // Validate listingType if provided
    if (listingType && !['personal', 'work'].includes(listingType)) {
      return NextResponse.json(
        { 
          error: 'Invalid listingType',
          validValues: ['personal', 'work']
        },
        { status: 400 }
      );
    }

    // Opportunistic maintenance: mark expired published listings as expired for this user.
    // (Public browse hides them via query filters; this makes the dashboard accurate.)
    if (listingType === 'work') {
      const partnerIdParam = searchParams.get('partnerId') || undefined;
      const partnerIdFromSession = user.partnerMemberships?.[0]?.partnerId || undefined;
      const partnerId = partnerIdParam ?? partnerIdFromSession;

      if (!partnerId) {
        return NextResponse.json(
          { error: 'Missing partnerId for work listings' },
          { status: 400 }
        );
      }

      const hasSessionAccess = user.partnerMemberships?.some((m) => m.partnerId === partnerId) === true;
      
      // ⚡ OPTIMIZATION: Check maintenance key BEFORE auth DB lookup - skip work if cached
      const maintenanceKey = `maintenance:expire:partner:${partnerId}`;
      const needsMaintenance = !memoryCache.get<boolean>(maintenanceKey);
      
      // ⚡ OPTIMIZATION: Run auth check and maintenance in parallel if both needed
      // This saves ~100-200ms by avoiding sequential DB calls
      if (!hasSessionAccess) {
        const [dbMembership] = await Promise.all([
          getActivePartnerStaffMembershipByUserIdAndPartnerId(user.id, partnerId),
          // Fire-and-forget maintenance (don't block on it if auth check fails)
          needsMaintenance 
            ? expirePublishedListingsForPartner(partnerId).then(() => {
                memoryCache.set(maintenanceKey, true, EXPIRY_MAINTENANCE_TTL_SECONDS);
              }).catch(() => {}) // Swallow errors - maintenance is best-effort
            : Promise.resolve()
        ]);
        
        if (!dbMembership) {
          return NextResponse.json(
            { error: 'Not authorized to view listings for this partner' },
            { status: 403 }
          );
        }
      } else if (needsMaintenance) {
        // User has session access - run maintenance in background (don't await)
        expirePublishedListingsForPartner(partnerId)
          .then(() => memoryCache.set(maintenanceKey, true, EXPIRY_MAINTENANCE_TTL_SECONDS))
          .catch(() => {}); // Fire and forget
      }

      // If staffMemberUserId is provided, filter to show only that staff member's listings
      // If not provided, show all listings for the partner (used by partner dashboard)
      const filterUserId = staffMemberUserId || undefined;

      // ⚡ OPTIMIZATION: Parallelize listings + stats fetch
      const listingsPromise = getListingsByPartnerId(partnerId, {
        status,
        moderationStatus,
        lifecycleStatus,
        userId: filterUserId,
        q,
        sort,
        limit,
        offset,
      });

      // For staff viewing their own listings, use user stats; for partners viewing all, use partner stats
      let statsPromise: Promise<
        | Awaited<ReturnType<typeof getListingStatsByUserId>>
        | Awaited<ReturnType<typeof getListingStatsByPartnerId>>
        | undefined
      > = Promise.resolve(undefined);

      if (includeStats) {
        if (staffMemberUserId) {
          const statsKey = `listingStats:user:${staffMemberUserId}:work`;
          const cachedStats = memoryCache.get<Awaited<ReturnType<typeof getListingStatsByUserId>>>(statsKey);
          if (cachedStats) {
            statsPromise = Promise.resolve(cachedStats);
          } else {
            statsPromise = getListingStatsByUserId(staffMemberUserId, { listingType: 'work' }).then(stats => {
              memoryCache.set(statsKey, stats, LISTING_STATS_TTL_SECONDS);
              return stats;
            });
          }
        } else {
          const statsKey = `listingStats:partner:${partnerId}`;
          const cachedStats = memoryCache.get<Awaited<ReturnType<typeof getListingStatsByPartnerId>>>(statsKey);
          if (cachedStats) {
            statsPromise = Promise.resolve(cachedStats);
          } else {
            statsPromise = getListingStatsByPartnerId(partnerId).then(stats => {
              memoryCache.set(statsKey, stats, LISTING_STATS_TTL_SECONDS);
              return stats;
            });
          }
        }
      }

      // Wait for both in parallel
      const [listings, statsToUse] = await Promise.all([listingsPromise, statsPromise]);

      return NextResponse.json({
        success: true,
        data: listings,
        listings, // backwards compatibility for older dashboard components
        stats: statsToUse,
        meta: {
          count: listings.length,
          limit,
          offset,
        },
      });
    }

    // ⚡ OPTIMIZATION: Fire-and-forget maintenance (don't block on expiry update)
    const maintenanceKey = `maintenance:expire:user:${user.id}`;
    if (!memoryCache.get<boolean>(maintenanceKey)) {
      // Non-blocking: run in background just like work listings
      expirePublishedListingsForUser(user.id)
        .then(() => memoryCache.set(maintenanceKey, true, EXPIRY_MAINTENANCE_TTL_SECONDS))
        .catch(() => {}); // Fire and forget - maintenance is best-effort
    }

    logTiming('pre-queries');
    
    // ⚡ OPTIMIZATION: Parallelize listings + stats fetch with individual timing
    const listingsStart = performance.now();
    const listingsPromise = getListingsByUserId(user.id, {
      status,
      moderationStatus,
      lifecycleStatus,
      listingType,
      q,
      sort,
      limit,
      offset,
    }).then(result => {
      if (DEBUG_TIMING) console.log(`[my-listings] listings-query: ${(performance.now() - listingsStart).toFixed(0)}ms (${result.length} rows)`);
      return result;
    });

    let statsPromise: Promise<Awaited<ReturnType<typeof getListingStatsByUserId>> | undefined> = Promise.resolve(undefined);
    if (includeStats) {
      const statsKey = `listingStats:user:${user.id}:${listingType ?? 'all'}`;
      const cachedStats = memoryCache.get<Awaited<ReturnType<typeof getListingStatsByUserId>>>(statsKey);
      if (cachedStats) {
        if (DEBUG_TIMING) console.log(`[my-listings] stats-query: 0ms (cache hit)`);
        statsPromise = Promise.resolve(cachedStats);
      } else {
        const statsStart = performance.now();
        statsPromise = getListingStatsByUserId(user.id, { listingType }).then(stats => {
          if (DEBUG_TIMING) console.log(`[my-listings] stats-query: ${(performance.now() - statsStart).toFixed(0)}ms`);
          memoryCache.set(statsKey, stats, LISTING_STATS_TTL_SECONDS);
          return stats;
        });
      }
    }

    // Wait for both in parallel
    const [listings, statsToUse] = await Promise.all([listingsPromise, statsPromise]);
    logTiming('queries-done');

    return NextResponse.json({
      success: true,
      data: listings,
      listings, // backwards compatibility for older dashboard components
      stats: statsToUse,
      meta: {
        count: listings.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
