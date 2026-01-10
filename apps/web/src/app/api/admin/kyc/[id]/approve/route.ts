/**
 * Admin KYC Approve API
 * 
 * POST /api/admin/kyc/[id]/approve - Approve a KYC record
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { approveKycRecord } from '@alifh/database';

export const runtime = 'nodejs';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await approveKycRecord(id, user.id);

    if (!result) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    console.log(`[Admin/KYC] Record ${id} approved by admin ${user.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'KYC approved successfully',
      record: result,
    });
  } catch (error) {
    console.error('[Admin/KYC] Approve failed:', error);
    return NextResponse.json({ error: 'Failed to approve KYC' }, { status: 500 });
  }
}
