/**
 * API: Mark Listing as Sold
 * POST /api/listings/[id]/mark-sold
 * 
 * Supports:
 * - Direct user ownership (userId match)
 * - Partner staff with manageListings permission
 * - Admin override
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  checkListingOwnership,
  createAuditLogEntry,
  getListingModerationContext,
  markCarListingSold,
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
    const isDirectOwner = await checkListingOwnership(id, user.id);
    
    // Check if user has partner access with manageListings permission
    const partnerMembership = user.partnerMemberships?.[0];
    const hasPartnerListingAccess = partnerMembership?.permissions?.manageListings === true;
    const partnerId = partnerMembership?.partnerId;
    
    // Get listing context to check if it belongs to the user's partner
    const before = await getListingModerationContext(id);
    if (!before) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Check if listing belongs to user's partner
    const isPartnerListing = partnerId && before.partnerId === partnerId;
    
    // Authorization: admin, direct owner, or partner staff with permission
    const canMarkSold = isAdmin || isDirectOwner || (hasPartnerListingAccess && isPartnerListing);
    
    if (!canMarkSold) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark as sold - pass partnerId if this is a partner listing
    const result = await markCarListingSold({ 
      listingId: id, 
      userId: user.id,
      partnerId: isPartnerListing ? partnerId : undefined,
    });
    
    if (result.success === false) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

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
