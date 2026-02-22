/**
 * API: Partner Billing Checkout
 * POST /api/partner/billing/checkout
 * 
 * Creates a Stripe Checkout session for subscribing to a plan.
 * Used when partner wants to upgrade from trial or switch plans.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStripeClient, isStripeConfigured, PLANS, PlanName, createStripeCustomerForUser } from '@/lib/stripe/config';
import { getUserById, db, partner as partnerTable, eq, updateUserStripeCustomerId } from '@alifh/database';

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
        { error: 'Only partner owners can manage billing' },
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

    // Parse request body
    const body = await req.json();
    const { plan } = body as { plan: PlanName };

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "flow" or "black"' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID (create if needed)
    let user = await getUserById(sessionUser.id);
    let stripeCustomerId = user?.stripeCustomerId;
    
    // Auto-create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomerForUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name || undefined,
      });
      
      if (stripeCustomerId) {
        await updateUserStripeCustomerId(sessionUser.id, stripeCustomerId);
      } else {
        return NextResponse.json(
          { error: 'Failed to create billing account. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Get partner data for metadata and trial calculation
    const [partnerData] = await db
      .select({
        id: partnerTable.id,
        brandName: partnerTable.brandName,
        createdAt: partnerTable.createdAt,
        tier: partnerTable.tier,
        trialEndDate: partnerTable.trialEndDate,
        trialMonths: partnerTable.trialMonths,
      })
      .from(partnerTable)
      .where(eq(partnerTable.id, partnerMembership.partnerId))
      .limit(1);

    const stripe = getStripeClient();

    // Get price ID from env
    const priceId = plan === 'black' 
      ? process.env.STRIPE_PRICE_ALIFH_BLACK 
      : process.env.STRIPE_PRICE_ALIFH_FLOW;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 500 }
      );
    }

    // Calculate remaining free trial days
    // Use admin-set trialEndDate if available, otherwise fall back to config-based calculation
    let trialEndDate: Date;
    
    if (partnerData?.trialEndDate) {
      // Admin set a specific trial end date during approval
      trialEndDate = new Date(partnerData.trialEndDate);
    } else {
      // Fallback: calculate from partner creation + plan freeMonths
      const planConfig = PLANS[plan];
      const partnerCreatedAt = partnerData?.createdAt || new Date();
      trialEndDate = new Date(partnerCreatedAt);
      trialEndDate.setMonth(trialEndDate.getMonth() + planConfig.freeMonths);
    }
    
    const now = new Date();
    const remainingTrialMs = trialEndDate.getTime() - now.getTime();
    const remainingTrialDays = Math.max(0, Math.ceil(remainingTrialMs / (1000 * 60 * 60 * 24)));
    
    // Only apply trial if there are remaining days
    const hasRemainingTrial = remainingTrialDays > 0;

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/partner-dashboard/subscription?checkout=success`;
    const cancelUrl = `${baseUrl}/partner-dashboard/subscription?checkout=cancelled`;

    // Create Checkout session with trial if applicable
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        partnerId: partnerMembership.partnerId,
        partnerName: partnerData?.brandName || '',
        userId: sessionUser.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          partnerId: partnerMembership.partnerId,
          plan: plan,
        },
        // Honor remaining free trial - Stripe needs Unix timestamp
        ...(hasRemainingTrial ? { trial_end: Math.floor(trialEndDate.getTime() / 1000) } : {}),
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address
      billing_address_collection: 'required',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      },
    });
  } catch (error) {
    console.error('[API] Partner billing checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
