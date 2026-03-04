/**
 * Stripe Webhook Handler
 * POST /api/webhook/stripe
 * 
 * Handles Stripe webhook events to sync subscription changes to partner.tier in DB.
 * This ensures the database is the source of truth for partner subscription status.
 * 
 * Events handled:
 * - checkout.session.completed: Update tier when checkout completes
 * - customer.subscription.updated: Update tier when subscription changes
 * - customer.subscription.deleted: Reset tier to standard when subscription ends
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient, isStripeConfigured, PLANS } from '@/lib/stripe/config';
import { db, partner as partnerTable, eq } from '@alifh/database';

export const runtime = 'nodejs';

// Disable body parsing, we need raw body for webhook verification
export const dynamic = 'force-dynamic';

/**
 * Update partner tier based on subscription plan
 */
async function updatePartnerTier(partnerId: string, planName: string, subscriptionStatus: string) {
  // Determine tier from plan name
  const newTier = planName === 'black' ? 'black' : 'standard';
  
  // Also update blackListingQuota based on tier
  const blackListingQuota = newTier === 'black' ? 5 : 1;
  
  console.log(`[Stripe Webhook] Updating partner ${partnerId}: tier=${newTier}, status=${subscriptionStatus}`);
  
  await db
    .update(partnerTable)
    .set({
      tier: newTier,
      subscriptionTier: planName,
      blackListingQuota: blackListingQuota,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
}

/**
 * Reset partner tier when subscription is cancelled/deleted
 */
async function resetPartnerTier(partnerId: string) {
  console.log(`[Stripe Webhook] Resetting partner ${partnerId} to standard tier (subscription cancelled)`);
  
  await db
    .update(partnerTable)
    .set({
      tier: 'standard',
      subscriptionTier: 'basic',
      blackListingQuota: 1,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
}

/**
 * Get partner ID from Stripe subscription metadata
 */
function getPartnerIdFromMetadata(metadata: Stripe.Metadata | null | undefined): string | null {
  return metadata?.partnerId || null;
}

/**
 * Get plan name from Stripe price ID
 */
function getPlanFromPriceId(priceId: string | null | undefined): string {
  if (priceId === process.env.STRIPE_PRICE_ALIFH_BLACK) {
    return 'black';
  }
  return 'flow';
}

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      console.error('[Stripe Webhook] Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get partner ID from session metadata
        const partnerId = session.metadata?.partnerId;
        const planName = session.metadata?.plan;
        
        if (partnerId && planName) {
          await updatePartnerTier(partnerId, planName, 'active');
          console.log(`[Stripe Webhook] Checkout completed: partner=${partnerId}, plan=${planName}`);
        } else {
          console.warn('[Stripe Webhook] checkout.session.completed missing partnerId or plan in metadata');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get partner ID from subscription metadata
        const partnerId = getPartnerIdFromMetadata(subscription.metadata);
        
        if (!partnerId) {
          console.warn(`[Stripe Webhook] ${event.type}: subscription ${subscription.id} has no partnerId in metadata`);
          break;
        }

        // Get plan from price ID
        const priceId = subscription.items.data[0]?.price.id;
        const planName = subscription.metadata?.plan || getPlanFromPriceId(priceId);
        
        // Only update tier for active/trialing subscriptions
        if (['active', 'trialing'].includes(subscription.status)) {
          await updatePartnerTier(partnerId, planName, subscription.status);
        } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
          // Subscription ended - reset to standard
          await resetPartnerTier(partnerId);
        }
        
        console.log(`[Stripe Webhook] Subscription ${event.type}: partner=${partnerId}, plan=${planName}, status=${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const partnerId = getPartnerIdFromMetadata(subscription.metadata);
        
        if (partnerId) {
          await resetPartnerTier(partnerId);
          console.log(`[Stripe Webhook] Subscription deleted: partner=${partnerId} reset to standard`);
        } else {
          console.warn('[Stripe Webhook] subscription.deleted: no partnerId in metadata');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
        // Could add additional logic here if needed
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
        // Could add notification logic here
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
