/**
 * API: Partner Billing Subscription
 * GET /api/partner/billing/subscription
 * 
 * Fetches current subscription status directly from Stripe.
 * No DB sync needed - Stripe is source of truth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getStripeClient, isStripeConfigured, PLANS } from '@/lib/stripe/config';
import { getUserById, db, partner as partnerTable, eq } from '@alifh/database';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
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
      // No Stripe customer yet - return trial/free state
      const [partnerData] = await db
        .select({
          tier: partnerTable.tier,
          createdAt: partnerTable.createdAt,
          trialEndDate: partnerTable.trialEndDate,
          trialMonths: partnerTable.trialMonths,
        })
        .from(partnerTable)
        .where(eq(partnerTable.id, partnerMembership.partnerId))
        .limit(1);

      // Use admin-set trial end date if available, otherwise calculate from config
      const plan = partnerData?.tier === 'black' ? PLANS.black : PLANS.flow;
      let freeTrialEndDate: Date;
      
      if (partnerData?.trialEndDate) {
        freeTrialEndDate = new Date(partnerData.trialEndDate);
      } else {
        freeTrialEndDate = new Date(partnerData?.createdAt || new Date());
        freeTrialEndDate.setMonth(freeTrialEndDate.getMonth() + plan.freeMonths);
      }
      
      const isInTrial = new Date() < freeTrialEndDate;

      return NextResponse.json({
        success: true,
        data: {
          status: isInTrial ? 'trialing' : 'inactive',
          plan: plan.name,
          planDisplayName: plan.displayName,
          priceAED: plan.priceAED,
          trialEnd: freeTrialEndDate.toISOString(),
          trialMonths: partnerData?.trialMonths || null,
          subscription: null,
          hasStripeCustomer: false,
        },
      });
    }

    const stripe = getStripeClient();
    
    // Get partner tier for plan mapping
    const [partnerData] = await db
      .select({
        tier: partnerTable.tier,
        createdAt: partnerTable.createdAt,
        trialEndDate: partnerTable.trialEndDate,
        trialMonths: partnerTable.trialMonths,
      })
      .from(partnerTable)
      .where(eq(partnerTable.id, partnerMembership.partnerId))
      .limit(1);

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method'],
    });

    const activeSubscription = subscriptions.data[0];

    if (!activeSubscription) {
      // No subscription - check if still in free trial period
      const plan = partnerData?.tier === 'black' ? PLANS.black : PLANS.flow;
      
      // Use admin-set trial end date if available
      let freeTrialEndDate: Date;
      if (partnerData?.trialEndDate) {
        freeTrialEndDate = new Date(partnerData.trialEndDate);
      } else {
        freeTrialEndDate = new Date(partnerData?.createdAt || new Date());
        freeTrialEndDate.setMonth(freeTrialEndDate.getMonth() + plan.freeMonths);
      }
      
      const isInTrial = new Date() < freeTrialEndDate;

      return NextResponse.json({
        success: true,
        data: {
          status: isInTrial ? 'trialing' : 'inactive',
          plan: plan.name,
          planDisplayName: plan.displayName,
          priceAED: plan.priceAED,
          trialEnd: freeTrialEndDate.toISOString(),
          trialMonths: partnerData?.trialMonths || null,
          subscription: null,
          hasStripeCustomer: true,
        },
      });
    }

    // Map Stripe price to our plan
    const priceId = activeSubscription.items.data[0]?.price.id;
    const isBlackPlan = priceId === process.env.STRIPE_PRICE_ALIFH_BLACK;
    const plan = isBlackPlan ? PLANS.black : PLANS.flow;

    // Get payment method info if available
    const paymentMethod = activeSubscription.default_payment_method as any;
    const cardInfo = paymentMethod?.card ? {
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
    } : null;

    // Access subscription properties (use currentPeriodStart/End for v20+)
    const currentPeriodStart = (activeSubscription as any).currentPeriodStart || (activeSubscription as any).current_period_start;
    const currentPeriodEnd = (activeSubscription as any).currentPeriodEnd || (activeSubscription as any).current_period_end;

    return NextResponse.json({
      success: true,
      data: {
        status: activeSubscription.status,
        plan: plan.name,
        planDisplayName: plan.displayName,
        priceAED: plan.priceAED,
        currentPeriodStart: currentPeriodStart 
          ? new Date(currentPeriodStart * 1000).toISOString()
          : null,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        trialEnd: activeSubscription.trial_end
          ? new Date(activeSubscription.trial_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
        cancelAt: activeSubscription.cancel_at
          ? new Date(activeSubscription.cancel_at * 1000).toISOString()
          : null,
        subscription: {
          id: activeSubscription.id,
          created: new Date(activeSubscription.created * 1000).toISOString(),
        },
        paymentMethod: cardInfo,
        hasStripeCustomer: true,
      },
    });
  } catch (error) {
    console.error('[API] Partner billing subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
