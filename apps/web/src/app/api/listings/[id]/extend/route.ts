/**
 * API: Extend Listing Expiry
 * POST /api/listings/[id]/extend
 *
 * Allows listing owner (or admin) to extend expiry within the last 2 days.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  checkListingOwnership,
  createAuditLogEntry,
  extendCarListingExpiry,
  getListingModerationContext,
  invalidateListingCaches,
} from '@alifh/database';
import { getClientIp } from '@/lib/utils/get-client-ip';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_LISTINGS,
} from '@/lib/rate-limit';

const extendLimiter = createRateLimiter(RATE_LIMITS_LISTINGS.UPDATE);

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await extendLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const days = Number(body?.days);

    if (![7, 14].includes(days)) {
      return NextResponse.json({ error: 'days must be 7 or 14' }, { status: 400 });
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isOwner = await checkListingOwnership(id, user.id);
    if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const before = await getListingModerationContext(id);

    const result = await extendCarListingExpiry({
      listingId: id,
      userId: user.id,
      days: days as 7 | 14,
    });

    if (result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Invalidate all listing caches using centralized function
    invalidateListingCaches(id, before?.partnerId || undefined);

    void createAuditLogEntry({
      action: 'listing.extend_expiry',
      entityType: 'car_listing',
      entityId: id,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata: {
        days,
      },
      oldValues: {
        expiresAt: before?.expiresAt ? before.expiresAt.toISOString() : null,
      },
      newValues: {
        expiresAt: result.expiresAt.toISOString(),
      },
    }).catch((error) => {
      console.error('[Audit] Failed to write listing.extend_expiry log:', error);
    });

    return NextResponse.json({ success: true, expiresAt: result.expiresAt.toISOString() });
  } catch (error) {
    console.error('Error extending listing expiry:', error);
    return NextResponse.json({ error: 'Failed to extend listing' }, { status: 500 });
  }
}
