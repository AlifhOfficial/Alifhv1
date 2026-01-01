/**
 * POST /api/partner/google-reviews/sync
 * 
 * Trigger Google Reviews sync for current partner
 * Called when partner updates their Google Maps URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { googleReviews } from '@alifh/database';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get partner ID from session or body
    const body = await req.json().catch(() => ({}));
    const partnerId = body.partnerId;
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
    }
    
    // TODO: Verify user has permission for this partner
    // (owner, admin, or staff member)
    
    const result = await googleReviews.syncPartnerReviews(partnerId);
    
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
    });
  } catch (error) {
    console.error('[API] Google reviews sync failed:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
