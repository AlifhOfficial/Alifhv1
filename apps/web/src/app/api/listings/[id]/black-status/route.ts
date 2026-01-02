/**
 * API: Toggle Black Listing Status
 * POST /api/listings/[id]/black-status
 * 
 * Purpose: Promote or demote a listing to/from black status
 * Authentication: Required (partner staff with permission)
 * 
 * Black Listing Quota:
 * - Black tier partners: max 5 active black listings
 * - Other tier partners: max 1 active black listing
 * 
 * Notes:
 * - Black listings appear on a separate signature page, not normal listings
 * - Quota is tracked via partner.activeBlackListingsCount
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  db,
  carListing,
  partner,
  createAuditLogEntry,
  invalidateListingCaches,
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  eq, sql,
} from '@alifh/database';
import { getClientIp } from '@/lib/utils/get-client-ip';

export const runtime = 'nodejs';

const requestSchema = z.object({
  isBlkListing: z.boolean(),
});

/**
 * POST /api/listings/[id]/black-status
 * Toggle black listing status with quota enforcement
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;

    // Parse and validate body
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { isBlkListing: newBlackStatus } = parseResult.data;

    // Fetch listing with partner data
    const [listing] = await db
      .select({
        id: carListing.id,
        partnerId: carListing.partnerId,
        userId: carListing.userId,
        isBlkListing: carListing.isBlkListing,
        moderationStatus: carListing.moderationStatus,
        lifecycleStatus: carListing.lifecycleStatus,
        make: carListing.make,
        model: carListing.model,
        year: carListing.year,
      })
      .from(carListing)
      .where(eq(carListing.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Must be a partner listing
    if (!listing.partnerId) {
      return NextResponse.json(
        { error: 'Only partner listings can be promoted to black' },
        { status: 400 }
      );
    }

    // Must be approved and active
    if (listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
      return NextResponse.json(
        { error: 'Only approved active listings can be promoted to black' },
        { status: 400 }
      );
    }

    // Check permission - must be partner staff (not viewer)
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    let canManage = isAdmin;
    
    if (!canManage) {
      const membership = await getActivePartnerStaffMembershipByUserIdAndPartnerId(
        user.id,
        listing.partnerId
      );
      canManage = !!membership && membership.role !== 'viewer';
    }

    if (!canManage) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If status is already the same, no-op
    if (listing.isBlkListing === newBlackStatus) {
      return NextResponse.json({
        success: true,
        message: `Listing is already ${newBlackStatus ? 'a black listing' : 'a regular listing'}`,
        isBlkListing: newBlackStatus,
      });
    }

    // Fetch partner quota data
    const [partnerData] = await db
      .select({
        id: partner.id,
        tier: partner.tier,
        blackListingQuota: partner.blackListingQuota,
        activeBlackListingsCount: partner.activeBlackListingsCount,
      })
      .from(partner)
      .where(eq(partner.id, listing.partnerId))
      .limit(1);

    if (!partnerData) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // If promoting to black, check quota
    if (newBlackStatus) {
      if (partnerData.activeBlackListingsCount >= partnerData.blackListingQuota) {
        return NextResponse.json(
          {
            error: 'Black listing quota exceeded',
            quota: partnerData.blackListingQuota,
            current: partnerData.activeBlackListingsCount,
            tier: partnerData.tier,
          },
          { status: 400 }
        );
      }
    }

    // Update listing status
    await db
      .update(carListing)
      .set({
        isBlkListing: newBlackStatus,
        updatedAt: new Date(),
      })
      .where(eq(carListing.id, listingId));

    // Update partner counter atomically using SQL increment/decrement
    // This is safer than read-modify-write even without transactions
    if (newBlackStatus) {
      // Promoting to black: increment counter
      await db
        .update(partner)
        .set({
          activeBlackListingsCount: sql`GREATEST(0, ${partner.activeBlackListingsCount} + 1)`,
          updatedAt: new Date(),
        })
        .where(eq(partner.id, listing.partnerId!));
    } else {
      // Demoting from black: decrement counter (never go below 0)
      await db
        .update(partner)
        .set({
          activeBlackListingsCount: sql`GREATEST(0, ${partner.activeBlackListingsCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(partner.id, listing.partnerId!));
    }
    
    // Calculate new count for response
    const newCount = newBlackStatus
      ? partnerData.activeBlackListingsCount + 1
      : Math.max(0, partnerData.activeBlackListingsCount - 1);

    // Audit log
    await createAuditLogEntry({
      action: newBlackStatus ? 'listing.promoted_to_black' : 'listing.demoted_from_black',
      entityType: 'car_listing',
      entityId: listingId,
      userId: user.id,
      metadata: {
        partnerId: listing.partnerId,
        listingTitle: `${listing.year} ${listing.make} ${listing.model}`,
        previousStatus: listing.isBlkListing,
        newStatus: newBlackStatus,
        quotaAfter: newCount,
        quotaMax: partnerData.blackListingQuota,
      },
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent') || undefined,
      severity: 'info',
    });

    // Invalidate caches
    await invalidateListingCaches(listingId, listing.partnerId);

    return NextResponse.json({
      success: true,
      data: {
        isBlkListing: newBlackStatus,
        quota: {
          current: newCount,
          max: partnerData.blackListingQuota,
        },
      },
      message: newBlackStatus
        ? 'Listing promoted to black'
        : 'Listing removed from black',
    });
  } catch (error) {
    console.error('[API] Error toggling black status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings/[id]/black-status
 * Get black status eligibility for a listing
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: listingId } = await params;

    // Fetch listing
    const [listing] = await db
      .select({
        id: carListing.id,
        partnerId: carListing.partnerId,
        isBlkListing: carListing.isBlkListing,
        moderationStatus: carListing.moderationStatus,
        lifecycleStatus: carListing.lifecycleStatus,
      })
      .from(carListing)
      .where(eq(carListing.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (!listing.partnerId) {
      return NextResponse.json({
        isBlkListing: false,
        eligible: false,
        reason: 'Only partner listings can be black listings',
      });
    }

    // Fetch partner quota
    const [partnerData] = await db
      .select({
        tier: partner.tier,
        blackListingQuota: partner.blackListingQuota,
        activeBlackListingsCount: partner.activeBlackListingsCount,
      })
      .from(partner)
      .where(eq(partner.id, listing.partnerId))
      .limit(1);

    const isApprovedActive =
      listing.moderationStatus === 'approved' && listing.lifecycleStatus === 'active';
    const hasQuotaAvailable =
      partnerData && partnerData.activeBlackListingsCount < partnerData.blackListingQuota;

    return NextResponse.json({
      isBlkListing: listing.isBlkListing,
      eligible: isApprovedActive && (listing.isBlkListing || hasQuotaAvailable),
      reason: !isApprovedActive
        ? 'Listing must be approved and active'
        : !hasQuotaAvailable && !listing.isBlkListing
          ? 'Black listing quota exceeded'
          : null,
      quota: partnerData
        ? {
            used: partnerData.activeBlackListingsCount,
            max: partnerData.blackListingQuota,
            tier: partnerData.tier,
          }
        : null,
    });
  } catch (error) {
    console.error('[API] Error getting black status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
