import { NextRequest, NextResponse } from 'next/server';
import { getAdminBanAppeals, approveBanAppeal, rejectBanAppeal } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


/**
 * GET /api/admin/appeals/ban - List all ban appeals
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

    const appeals = await getAdminBanAppeals(status || undefined);

    return NextResponse.json({ appeals });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch ban appeals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/appeals/ban - Review a ban appeal
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }


    const { appealId, action, reviewNote } = await request.json();

    if (!appealId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'approve') {
      result = await approveBanAppeal(appealId, user.id, reviewNote);
    } else {
      result = await rejectBanAppeal(appealId, user.id, reviewNote);
    }

    const response = NextResponse.json(result);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to review appeal' },
      { status: 500 }
    );
  }
}
