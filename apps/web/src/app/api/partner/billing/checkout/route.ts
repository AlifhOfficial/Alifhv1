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

    // Get partner data for metadata, trial calculation, and billing name
    const [partnerData] = await db
      .select({
        id: partnerTable.id,
        brandName: partnerTable.brandName,
        companyNameLegal: partnerTable.companyNameLegal,
        createdAt: partnerTable.createdAt,
        tier: partnerTable.tier,
        trialEndDate: partnerTable.trialEndDate,
        trialMonths: partnerTable.trialMonths,
      })
      .from(partnerTable)
      .where(eq(partnerTable.id, partnerMembership.partnerId))
      .limit(1);

    // Get user's Stripe customer ID (create if needed)
    const user = await getUserById(sessionUser.id);
    let stripeCustomerId = user?.stripeCustomerId;
    
    const stripe = getStripeClient();
    
    // Get company legal name for B2B invoicing (appears on invoices)
    const billingName = partnerData?.companyNameLegal || partnerData?.brandName || sessionUser.name;
    
    if (!stripeCustomerId) {
      // Create new Stripe customer with company legal name
      stripeCustomerId = await createStripeCustomerForUser(
        {
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name || undefined,
        },
        billingName // Bill to company legal name, not personal name
      );
      
      if (stripeCustomerId) {
        await updateUserStripeCustomerId(sessionUser.id, stripeCustomerId);
      } else {
        return NextResponse.json(
          { error: 'Failed to create billing account. Please contact support.' },
          { status: 500 }
        );
      }
    } else if (billingName) {
      // Customer exists but may have been created during registration with user's personal name
      // Update to company legal name for proper B2B invoicing
      try {
        await stripe.customers.update(stripeCustomerId, {
          name: billingName,
          metadata: {
            partnerId: partnerMembership.partnerId,
            companyNameLegal: partnerData?.companyNameLegal || '',
          },
        });
      } catch (e) {
        console.error('[Checkout] Failed to update Stripe customer name:', e);
        // Continue anyway - not critical
      }
    }

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

    if (!priceId.startsWith('price_')) {
      console.error(`[Checkout] Invalid Stripe price ID for ${plan}: expected price_..., got ${priceId.slice(0, 5)}...`);
      return NextResponse.json(
        { error: 'Billing price is misconfigured. Please contact support.' },
        { status: 500 }
      );
    }

    // Get current partner tier from DB (flow or black)
    const currentTier = partnerData?.tier || 'flow';
    const isUpgrade = currentTier !== 'black' && plan === 'black';
    const _isDowngrade = currentTier === 'black' && plan === 'flow';
    const isSamePlan = (currentTier === 'black' && plan === 'black') || 
                       (currentTier === 'flow' && plan === 'flow');
    
    // Calculate remaining free trial days
    // IMPORTANT: Trial only applies if staying on same plan or adding payment method
    // Upgrading to Black during trial requires PAYMENT - no free upgrade
    let hasRemainingTrial = false;
    let trialEndDate: Date | null = null;
    
    if (partnerData?.trialEndDate) {
      trialEndDate = new Date(partnerData.trialEndDate);
      const now = new Date();
      const isInTrial = now < trialEndDate;
      
      // Only honor trial if:
      // 1. Currently in trial period AND
      // 2. Staying on same plan (not upgrading to Black)
      // Upgrading to Black = pay immediately, no trial benefit
      if (isInTrial && isSamePlan) {
        hasRemainingTrial = true;
      } else if (isInTrial && isUpgrade) {
        // User is upgrading during trial - they pay for Black immediately
        // No trial period for upgrades
        console.warn(`[Checkout] Partner ${partnerMembership.partnerId} upgrading from ${currentTier} to ${plan} during trial - no trial benefit for upgrade`);
        hasRemainingTrial = false;
      }
    }

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
        // Only applies when staying on same plan, NOT for upgrades
        ...(hasRemainingTrial && trialEndDate ? { trial_end: Math.floor(trialEndDate.getTime() / 1000) } : {}),
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
