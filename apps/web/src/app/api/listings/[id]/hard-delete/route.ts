/**
 * API: Hard Delete Listing (Owner)
 * DELETE /api/listings/[id]/hard-delete
 *
 * Permanent delete. Use sparingly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  checkListingOwnership,
  createAuditLogEntry,
  hardDeleteCarListing,
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

const deleteLimiter = createRateLimiter(RATE_LIMITS_LISTINGS.DELETE);

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit by user
    const identifier = getIdentifier(req, user.id);
    const rateLimitResult = await deleteLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { id } = await params;

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isOwner = await checkListingOwnership(id, user.id);
    if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (isAdmin) {
      return NextResponse.json(
        { error: 'Admins should delete via /api/admin/listings/[id]' },
        { status: 403 }
      );
    }

    const before = await getListingModerationContext(id);

    const ok = await hardDeleteCarListing({ listingId: id, userId: user.id });

    if (!ok) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Invalidate all listing caches using centralized function
    invalidateListingCaches(id, before?.partnerId || undefined);

    void createAuditLogEntry({
      action: 'listing.hard_delete',
      entityType: 'car_listing',
      entityId: id,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      oldValues: before
        ? {
            moderationStatus: before.moderationStatus,
            lifecycleStatus: before.lifecycleStatus,
          }
        : null,
      newValues: null,
    }).catch((error) => {
      console.error('[Audit] Failed to write listing.hard_delete log:', error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error hard deleting listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
