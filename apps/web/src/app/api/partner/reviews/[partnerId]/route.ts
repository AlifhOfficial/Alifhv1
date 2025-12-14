/**
 * GET /api/partner/reviews/[partnerId]
 * POST /api/partner/reviews/[partnerId]
 * 
 * Get reviews for a partner or create a new review
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPartnerReviews, createReview } from '@/lib/partner';
import { CreateReviewInputSchema } from '@alifh/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const { partnerId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as 'pending' | 'published' | 'hidden' | 'flagged' | null;
    const minRating = searchParams.get('minRating');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const filters: any = {};
    if (status) filters.status = status;
    if (minRating) filters.minRating = parseInt(minRating);
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);
    
    const reviews = await getPartnerReviews(partnerId, filters);
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { partnerId } = await params;
    const body = await request.json();
    
    const validated = CreateReviewInputSchema.parse({
      ...body,
      partnerId,
      userId: session.user.id,
    });
    
    const review = await createReview(validated);
    
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
