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
 * - customer.subscription.deleted: Reset tier to flow when subscription ends
 * - invoice.payment_failed: Disable staff accounts (keep partner dashboard open for owner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe/config';
import { db, partner as partnerTable, partnerStaff as partnerStaffTable, eq, and } from '@alifh/database';

export const runtime = 'nodejs';

// Disable body parsing, we need raw body for webhook verification
export const dynamic = 'force-dynamic';

/**
 * Update partner tier based on subscription plan
 */
async function updatePartnerTier(partnerId: string, planName: string, subscriptionStatus: string) {
  // Determine tier from plan name (flow or black)
  const newTier = planName === 'black' ? 'black' : 'flow';
  
  // Also update blackListingQuota based on tier
  const blackListingQuota = newTier === 'black' ? 5 : 1;
  
  // Set billingActive based on subscription status
  const billingActive = ['active', 'trialing'].includes(subscriptionStatus);
  
  console.warn(`[Stripe Webhook] Updating partner ${partnerId}: tier=${newTier}, status=${subscriptionStatus}, billingActive=${billingActive}`);
  
  await db
    .update(partnerTable)
    .set({
      tier: newTier,
      blackListingQuota: blackListingQuota,
      billingActive: billingActive,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
  
  // Re-enable staff accounts if subscription is active
  if (billingActive) {
    await enablePartnerStaff(partnerId);
  }
}

/**
 * Reset partner tier when subscription is cancelled/deleted
 */
async function resetPartnerTier(partnerId: string) {
  console.warn(`[Stripe Webhook] Resetting partner ${partnerId} to flow tier, billingActive=false (subscription cancelled)`);
  
  await db
    .update(partnerTable)
    .set({
      tier: 'flow',
      blackListingQuota: 1,
      billingActive: false,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
  
  // Disable staff accounts when subscription ends
  await disablePartnerStaff(partnerId);
}

/**
 * Disable all non-owner staff accounts for a partner
 * Owner keeps access to partner dashboard for billing management
 * Also sets billingActive to false on the partner
 */
async function disablePartnerStaff(partnerId: string) {
  console.warn(`[Stripe Webhook] Disabling staff for partner ${partnerId} and setting billingActive=false`);
  
  // Set partner billingActive to false
  await db
    .update(partnerTable)
    .set({
      billingActive: false,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
  
  // Suspend non-owner staff accounts
  await db
    .update(partnerStaffTable)
    .set({
      status: 'suspended',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaffTable.partnerId, partnerId),
        eq(partnerStaffTable.isOwner, false) // Keep owner active
      )
    );
}

/**
 * Re-enable staff accounts when subscription becomes active
 * Also sets billingActive to true on the partner
 */
async function enablePartnerStaff(partnerId: string) {
  console.warn(`[Stripe Webhook] Re-enabling staff for partner ${partnerId} and setting billingActive=true`);
  
  // Set partner billingActive to true
  await db
    .update(partnerTable)
    .set({
      billingActive: true,
      updatedAt: new Date(),
    })
    .where(eq(partnerTable.id, partnerId));
  
  // Only re-enable suspended staff (not 'left' or 'invited')
  await db
    .update(partnerStaffTable)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(partnerStaffTable.partnerId, partnerId),
        eq(partnerStaffTable.status, 'suspended')
      )
    );
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

    console.warn(`[Stripe Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get partner ID from session metadata
        const partnerId = session.metadata?.partnerId;
        const planName = session.metadata?.plan;
        
        if (partnerId && planName) {
          await updatePartnerTier(partnerId, planName, 'active');
          console.warn(`[Stripe Webhook] Checkout completed: partner=${partnerId}, plan=${planName}`);
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
        
        console.warn(`[Stripe Webhook] Subscription ${event.type}: partner=${partnerId}, plan=${planName}, status=${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const partnerId = getPartnerIdFromMetadata(subscription.metadata);
        
        if (partnerId) {
          await resetPartnerTier(partnerId);
          console.warn(`[Stripe Webhook] Subscription deleted: partner=${partnerId} reset to standard`);
        } else {
          console.warn('[Stripe Webhook] subscription.deleted: no partnerId in metadata');
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
        // Could add additional logic here if needed
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
        
        // Get subscription to find partnerId (subscription field may be string or object)
        const subscriptionId = typeof (invoice as any).subscription === 'string' 
          ? (invoice as any).subscription 
          : (invoice as any).subscription?.id;
          
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const partnerId = getPartnerIdFromMetadata(subscription.metadata);
            
            if (partnerId) {
              // Disable staff accounts (owner keeps access for billing management)
              await disablePartnerStaff(partnerId);
              console.warn(`[Stripe Webhook] Staff disabled for partner ${partnerId} due to payment failure`);
            }
          } catch (err) {
            console.error('[Stripe Webhook] Failed to process payment failure:', err);
          }
        }
        break;
      }

      default:
        console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`);
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
