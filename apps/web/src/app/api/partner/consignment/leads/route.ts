import { NextRequest, NextResponse } from 'next/server';
import {
  getActivePartnerStaffMembershipByUserId,
  getPartnerConsignmentLeads,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

/**
 * GET /api/partner/consignment/leads
 * Get partner's consignment leads with filtering (staff access)
 * 
 * Query params:
 * - status: filter by lead status (new, viewed, contacted, etc.)
 * - isPriority: filter by priority flag
 * - limit: number of results (default 20)
 * - offset: pagination offset
 */
export async function GET(req: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const isPriorityFilter = searchParams.get('isPriority') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const data = await getPartnerConsignmentLeads(membership.partnerId, {
      status: statusFilter,
      isPriority: isPriorityFilter,
      limit,
      offset,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching consignment leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
