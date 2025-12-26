import { NextRequest, NextResponse } from 'next/server';
import {
  applyPartnerConsignmentLeadAction,
  getActivePartnerStaffMembershipByUserId,
  getPartnerConsignmentLeadById,
  markPartnerConsignmentLeadViewed,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

/**
 * PATCH /api/partner/consignment/leads/[leadId]
 * Update lead status and perform actions (staff access)
 * 
 * Actions:
 * - view: Mark lead as viewed
 * - interested: Mark partner as interested
 * - contact: Mark lead as contacted
 * - accept: Accept the consignment deal
 * - reject: Reject the lead
 * - priority: Toggle priority flag
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const membership = await getActivePartnerStaffMembershipByUserId(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    const params = await context.params;
    const { leadId } = params;
    const body = await req.json();
    const { action, data } = body;

    const result = await applyPartnerConsignmentLeadAction({
      partnerId: membership.partnerId,
      leadId,
      actorUserId: user.id,
      action,
      data,
    });

    if (!result) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      lead: result,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/partner/consignment/leads/[leadId]
 * Get single lead details (staff access)
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const membership = await getActivePartnerStaffMembershipByUserId(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    const params = await context.params;
    const { leadId } = params;

    // Fetch lead with full details
    const lead = await getPartnerConsignmentLeadById(membership.partnerId, leadId);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Auto-increment view count if status is 'new'
    if (lead.status === 'new') {
      await markPartnerConsignmentLeadViewed(membership.partnerId, leadId);
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}
