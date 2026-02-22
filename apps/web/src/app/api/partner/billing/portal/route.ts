/**
 * API: Partner Billing Portal
 * POST /api/partner/billing/portal
 * 
 * Creates a Stripe Customer Portal session for managing subscriptions.
 * Partners can update payment methods, view invoices, cancel subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe/config';
import { getUserById } from '@alifh/database';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be partner owner
    const partnerMembership = sessionUser.partnerMemberships?.find(
      (m) => m.staffRole === 'owner'
    );
    if (!partnerMembership) {
      return NextResponse.json(
        { error: 'Only partner owners can access billing' },
        { status: 403 }
      );
    }

    // Check Stripe configuration
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Billing not configured' },
        { status: 503 }
      );
    }

    // Get user's Stripe customer ID
    const user = await getUserById(sessionUser.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please contact support.' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();

    // Get return URL from request body or use default
    const body = await req.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/partner-dashboard/subscription`;

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: portalSession.url,
      },
    });
  } catch (error) {
    console.error('[API] Partner billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
