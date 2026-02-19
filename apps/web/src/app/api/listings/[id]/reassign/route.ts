/**
 * API: Reassign Listing Manager
 * POST /api/listings/[id]/reassign
 * 
 * Purpose: Reassign a listing to a different staff member
 * Authentication: Required (partner owner/admin only)
 * 
 * Body:
 * - newUserId: The user ID of the staff member to assign
 * 
 * Standards:
 * - Returns 401 for no auth
 * - Returns 403 for non-owner/admin
 * - Returns 404 for listing not found
 * - Returns 400 for invalid staff member
 * - Returns 500 for server errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getListingModerationContext,
  getActivePartnerStaffMembershipByUserIdAndPartnerId,
  reassignListingManager,
} from '@alifh/database';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reassignSchema = z.object({
  newUserId: z.string().min(1, 'New user ID is required'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { id } = await params;

    // Get the listing
    const listing = await getListingModerationContext(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Must be a partner listing
    if (!listing.partnerId) {
      return NextResponse.json(
        { error: 'Only partner listings can be reassigned' },
        { status: 400 }
      );
    }

    // Check if user has partner access and is owner/admin
    const membership = user.partnerMemberships?.find(m => m.partnerId === listing.partnerId);
    if (!membership) {
      return NextResponse.json(
        { error: 'You do not have access to this partner' },
        { status: 403 }
      );
    }

    // Only owners and admins can reassign
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json(
        { error: 'Only owners and admins can reassign listings' },
        { status: 403 }
      );
    }

    // Parse and validate input
    const body = await req.json().catch(() => ({}));
    const validated = reassignSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { newUserId } = validated.data;

    // Verify the new user is an active staff member of the same partner
    const newUserMembership = await getActivePartnerStaffMembershipByUserIdAndPartnerId(
      newUserId,
      listing.partnerId
    );

    if (!newUserMembership) {
      return NextResponse.json(
        { error: 'The selected user is not an active staff member of this partner' },
        { status: 400 }
      );
    }

    // Reassign the listing (also reassigns conversations)
    const result = await reassignListingManager({
      listingId: id,
      newUserId,
      partnerId: listing.partnerId,
    });

    return NextResponse.json({
      success: true,
      message: result.conversationsReassigned > 0 
        ? `Listing and ${result.conversationsReassigned} conversation(s) reassigned successfully`
        : 'Listing reassigned successfully',
      data: result,
    });
  } catch (error) {
    console.error('[Listing Reassign] Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to reassign listing' },
      { status: 500 }
    );
  }
}
