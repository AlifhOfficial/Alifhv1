import { NextRequest, NextResponse } from 'next/server';
import { getAdminFeedback, reviewFeedback, markFeedbackRead, deleteFeedback, getUnreadFeedbackCount } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import { NO_CACHE_HEADERS } from '@/lib/cdn-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/feedback - List all feedback
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
    const status = searchParams.get('status') as 'new' | 'reviewed' | 'archived' | null;
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const count = await getUnreadFeedbackCount();
      return NextResponse.json({ count });
    }

    const feedback = await getAdminFeedback(status || undefined);

    const response = NextResponse.json({ feedback });
    Object.entries(NO_CACHE_HEADERS).forEach(([key, value]) => 
      response.headers.set(key, value)
    );
    return response;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/feedback - Review feedback or mark as read
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

    const { feedbackId, action, status, adminNote } = await request.json();

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    if (action === 'markRead') {
      await markFeedbackRead(feedbackId);
      return NextResponse.json({ success: true });
    }

    if (action === 'review') {
      if (!status || !['reviewed', 'archived'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      await reviewFeedback(feedbackId, user.id, status, adminNote);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/feedback - Delete feedback
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get('id');

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    await deleteFeedback(feedbackId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
