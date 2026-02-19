import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, getUserFeedback } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';


export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { title, content } = await request.json();

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Feedback content must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: 'Title must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Feedback content must be less than 2000 characters' },
        { status: 400 }
      );
    }

    const result = await createFeedback(user.id, title, content);

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedback = await getUserFeedback(user.id);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
