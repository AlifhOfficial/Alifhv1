/**
 * API: Partner Black Listing Quota
 * GET /api/partner/black-quota
 * 
 * Purpose: Get the partner's black listing quota and current usage
 * Authentication: Required (must be a partner member)
 * 
 * Returns:
 * - blackListingQuota: Maximum black listings allowed
 * - activeBlackListingsCount: Current number of active black listings
 * - partnerTier: The partner's membership tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { db, partner as partnerTable, eq } from '@alifh/database';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    // Auth check
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get partner ID from session
    const partnerId = user.partnerMemberships?.[0]?.partnerId;
    if (!partnerId) {
      return NextResponse.json(
        { error: 'Not a partner member' },
        { status: 403 }
      );
    }

    // Get partner data
    const [partnerData] = await db
      .select({
        id: partnerTable.id,
        tier: partnerTable.tier,
        blackListingQuota: partnerTable.blackListingQuota,
        activeBlackListingsCount: partnerTable.activeBlackListingsCount,
      })
      .from(partnerTable)
      .where(eq(partnerTable.id, partnerId))
      .limit(1);

    if (!partnerData) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Calculate correct quota based on tier (in case DB is out of sync)
    const expectedQuota = partnerData.tier === 'black' ? 5 : 1;
    
    // If quota doesn't match tier, auto-fix it
    if (partnerData.blackListingQuota !== expectedQuota) {
      await db
        .update(partnerTable)
        .set({
          blackListingQuota: expectedQuota,
          updatedAt: new Date(),
        })
        .where(eq(partnerTable.id, partnerId));
      
      // Use the corrected quota
      partnerData.blackListingQuota = expectedQuota;
      console.warn(`[API] Auto-fixed blackListingQuota for partner ${partnerId}: ${expectedQuota}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        partnerId: partnerData.id,
        tier: partnerData.tier,
        blackListingQuota: partnerData.blackListingQuota,
        activeBlackListingsCount: partnerData.activeBlackListingsCount,
        hasAvailableSlots: partnerData.activeBlackListingsCount < partnerData.blackListingQuota,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching black quota:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
