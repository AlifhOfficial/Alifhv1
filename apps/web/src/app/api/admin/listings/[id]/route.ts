/**
 * API: Admin Delete Listing
 * DELETE /api/admin/listings/[id]
 * 
 * Purpose: Permanently delete a listing
 * Authentication: Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getClientIp } from '@/lib/utils/get-client-ip';
import { createAuditLogEntry, deleteListingAsAdmin, getListingModerationContext, invalidateListingCaches } from '@alifh/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (sessionUser.role !== 'admin' && sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const before = await getListingModerationContext(id);

    // Delete the listing
    const ok = await deleteListingAsAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Invalidate all listing caches using centralized function
    invalidateListingCaches(id, before?.partnerId || undefined);

    void createAuditLogEntry({
      action: 'listing.hard_delete',
      entityType: 'car_listing',
      entityId: id,
      userId: sessionUser.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      oldValues: before
        ? {
            moderationStatus: before.moderationStatus,
            lifecycleStatus: before.lifecycleStatus,
            publishedAt: before.publishedAt ? before.publishedAt.toISOString() : null,
            expiresAt: before.expiresAt ? before.expiresAt.toISOString() : null,
          }
        : null,
      newValues: null,
    });

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
