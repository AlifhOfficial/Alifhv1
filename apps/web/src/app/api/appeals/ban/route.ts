import { NextRequest, NextResponse } from 'next/server';
import { createBanAppeal } from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  createRateLimiter,
  getIdentifier,
  rateLimitResponse,
  RATE_LIMITS_AUTH,
} from '@/lib/rate-limit';

// 3 appeals per day - prevent spam
const appealLimiter = createRateLimiter({
  windowSeconds: 24 * 60 * 60, // 1 day
  maxRequests: 3,
  keyPrefix: 'ban-appeal',
  description: 'Ban appeal submissions',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user
    const identifier = getIdentifier(request, user.id);
    const rateLimitResult = await appealLimiter.check(identifier);
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Appeal message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Create the appeal
    await createBanAppeal(user.id, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting ban appeal:', error);
    return NextResponse.json(
      { error: 'Failed to submit appeal' },
      { status: 500 }
    );
  }
}
