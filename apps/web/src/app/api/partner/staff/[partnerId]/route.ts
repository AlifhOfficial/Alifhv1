/**
 * GET /api/partner/staff/[partnerId]
 * 
 * Get all staff for a partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPartnerStaff } from '@/lib/partner';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as 'active' | 'invited' | 'suspended' | 'left' | null;
    const role = searchParams.get('role') as 'owner' | 'admin' | 'sales' | 'viewer' | null;
    
    const filters: any = {};
    if (status) filters.status = status;
    if (role) filters.role = role;
    
    const staff = await getPartnerStaff(partnerId, filters);
    
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching partner staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
