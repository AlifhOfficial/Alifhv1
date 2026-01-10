/**
 * Admin KYC Reject API
 * 
 * POST /api/admin/kyc/[id]/reject - Reject a KYC record
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import { rejectKycRecord } from '@alifh/database';

export const runtime = 'nodejs';

const RejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RejectSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { id } = await params;
    const result = await rejectKycRecord(id, user.id, parsed.data.reason);

    if (!result) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    console.log(`[Admin/KYC] Record ${id} rejected by admin ${user.id}: ${parsed.data.reason}`);

    return NextResponse.json({ 
      success: true, 
      message: 'KYC rejected',
      record: result,
    });
  } catch (error) {
    console.error('[Admin/KYC] Reject failed:', error);
    return NextResponse.json({ error: 'Failed to reject KYC' }, { status: 500 });
  }
}
