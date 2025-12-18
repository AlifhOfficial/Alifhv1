import { NextRequest, NextResponse } from 'next/server';
import { getPartnerMiniProfile, updatePartnerMiniProfile } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;

    const profile = await getPartnerMiniProfile(partnerId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching partner mini profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { partnerId } = await params;
    
    // Validate partnerId
    if (!partnerId || typeof partnerId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // TODO: Add permission check - verify user is staff member of this partner
    // const hasPermission = await checkPartnerStaffPermission(session.user.id, partnerId, 'manageSettings');
    // if (!hasPermission) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const updatedProfile = await updatePartnerMiniProfile(partnerId, body);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Return with cache headers
    return NextResponse.json(updatedProfile, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error updating partner mini profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
