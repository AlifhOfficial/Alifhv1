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
import { createAuditLogEntry, deleteListingAsAdmin, getListingModerationContext, getListingImagesForCleanup } from '@alifh/database';
import { deleteListingImages } from '@/lib/storage/listing-image-cleanup';


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
    
    // Get images BEFORE delete for R2 cleanup
    const imagesToDelete = await getListingImagesForCleanup(id);

    // Delete the listing (soft delete - sets lifecycleStatus to 'deleted')
    const ok = await deleteListingAsAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Delete images from R2 storage (async, don't block response)
    if (imagesToDelete.length > 0) {
      void deleteListingImages(imagesToDelete).catch((error) => {
        console.error('[admin-delete] Failed to cleanup images:', error);
      });
    }

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
