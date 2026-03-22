/**
 * POST /api/partner/google-reviews/sync
 * 
 * Trigger Google Reviews sync for current partner
 * Called when partner updates their Google Maps URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { googleReviews } from '@alifh/database';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication - uses proxy-cached session
    const user = await getSessionUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const partnerId = user.partnerMemberships?.[0]?.partnerId;
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const onlyFiveStar = body.onlyFiveStar === true;

    const result = await googleReviews.syncPartnerReviews(partnerId, { onlyFiveStar });
    
    if (!result.success) {
      console.error('[GoogleReviews] Sync failed:', result.error);
      return NextResponse.json({ 
        error: result.error || 'Sync failed' 
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      rating: result.rating,
      reviewCount: result.reviewCount,
      reviews: result.reviews ?? [],
    });
  } catch (error) {
    console.error('[API] Google reviews sync failed:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
