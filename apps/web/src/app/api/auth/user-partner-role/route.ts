import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/utils';
import { authQueries } from '@alifh/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.activePartnerId) {
      return NextResponse.json({ 
        partnerRole: null,
        partnerId: null
      });
    }

    const membership = await authQueries.getActivePartnerMembership(user.id);
    
    return NextResponse.json({
      partnerRole: membership?.role || null,
      partnerId: membership?.partnerId || null,
      isActive: membership?.isActive || false
    });
  } catch (error) {
    console.error('Error fetching user partner role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}