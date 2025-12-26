/**
 * API: Mark Listing as Sold
 * POST /api/listings/[id]/mark-sold
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  checkListingOwnership,
  createAuditLogEntry,
  getListingModerationContext,
  markCarListingSold,
  invalidateListingCaches,
} from '@alifh/database';
import { getClientIp } from '@/lib/utils/get-client-ip';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isOwner = await checkListingOwnership(id, user.id);
    if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const before = await getListingModerationContext(id);

    const result = await markCarListingSold({ listingId: id, userId: user.id });
    if (result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Invalidate all listing caches using centralized function
    invalidateListingCaches(id, before?.partnerId || undefined);

    void createAuditLogEntry({
      action: 'listing.mark_sold',
      entityType: 'car_listing',
      entityId: id,
      userId: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      oldValues: {
        lifecycleStatus: before?.lifecycleStatus ?? null,
      },
      newValues: {
        lifecycleStatus: 'sold',
      },
    }).catch((error) => {
      console.error('[Audit] Failed to write listing.mark_sold log:', error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking listing as sold:', error);
    return NextResponse.json({ error: 'Failed to mark listing as sold' }, { status: 500 });
  }
}
