/**
 * Stripe Configuration
 * 
 * SINGLE SOURCE OF TRUTH for Revvup subscription plans.
 * All components should import from here.
 * 
 * Plans:
 * - Revvup Flow: 7,000 AED/month (3 months free trial)
 * - Revvup Black: 21,000 AED/month (1 month free trial)
 * 
 * @module lib/stripe/config
 */

import Stripe from 'stripe';

// ============================================================================
// Stripe Client
// ============================================================================

/** Check if Stripe is configured */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

let _stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('[Stripe] STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover' as any,
    });
  }
  return _stripeClient;
}

// ============================================================================
// Plan Configuration - SINGLE SOURCE OF TRUTH
// ============================================================================

/** Partner welcome credits in AED */
export const PARTNER_WELCOME_CREDITS = 21000;

/** Plan names as constants */
export const PLAN_NAMES = {
  FLOW: 'flow',
  BLACK: 'black',
} as const;

export type PlanName = typeof PLAN_NAMES[keyof typeof PLAN_NAMES];

/** Full plan configuration */
export interface PlanConfig {
  name: PlanName;
  displayName: string;
  priceAED: number;
  description: string;
  freeMonths: number;
  features: string[];
  limits: {
    listings: number; // -1 = unlimited
    blackListings: number;
    staffMembers: number; // -1 = unlimited
    prioritySupport: boolean;
  };
}

/** All Revvup subscription plans */
export const PLANS: Record<PlanName, PlanConfig> = {
  flow: {
    name: 'flow',
    displayName: 'Revvup Flow',
    priceAED: 7000,
    description: 'Essential tools for car dealerships',
    freeMonths: 3, // 21k credits / 7k = 3 months
    features: [
      'Up to 50 active listings',
      '1 Black listing slot',
      '5 staff members',
      'Standard support',
      'Basic analytics',
      'Lead management',
    ],
    limits: {
      listings: 50,
      blackListings: 1,
      staffMembers: 5,
      prioritySupport: false,
    },
  },
  black: {
    name: 'black',
    displayName: 'Revvup Black',
    priceAED: 21000,
    description: 'Premium features for high-volume dealers',
    freeMonths: 0, // Black has no default trial - requires payment immediately
    features: [
      'Unlimited listings',
      '5 Black listing slots',
      'Unlimited staff members',
      'Priority support 24/7',
      'Advanced analytics & insights',
      'Lead management + CRM',
      'Featured partner badge',
      'Early access to new features',
    ],
    limits: {
      listings: -1,
      blackListings: 5,
      staffMembers: -1,
      prioritySupport: true,
    },
  },
};

/** Get plan by name */
export function getPlanByName(name: string): PlanConfig | undefined {
  return PLANS[name as PlanName];
}

/** Get all plans as array */
export function getPlansArray(): PlanConfig[] {
  return Object.values(PLANS);
}

// ============================================================================
// Better Auth Stripe Plugin Config
// ============================================================================

/** Stripe plans for Better Auth plugin */
export function getStripePlans() {
  return [
    {
      name: PLANS.flow.name,
      priceId: process.env.STRIPE_PRICE_ALIFH_FLOW!,
      priceAED: PLANS.flow.priceAED,
      freeTrial: { days: PLANS.flow.freeMonths * 30 },
      limits: PLANS.flow.limits,
    },
    {
      name: PLANS.black.name,
      priceId: process.env.STRIPE_PRICE_ALIFH_BLACK!,
      priceAED: PLANS.black.priceAED,
      freeTrial: { days: PLANS.black.freeMonths * 30 },
      limits: PLANS.black.limits,
    },
  ];
}

// ============================================================================
// Stripe Customer Management
// ============================================================================

/**
 * Create a Stripe customer for a verified user
 * Called after email verification (not on signup to prevent orphaned customers)
 */
export async function createStripeCustomerForUser(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<string | null> {
  if (!isStripeConfigured()) {
    console.log('[Stripe] Not configured, skipping customer creation');
    return null;
  }

  try {
    const stripe = getStripeClient();
    
    // Check if customer already exists (prevents duplicates)
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      console.log(`[Stripe] Customer already exists for ${user.email}: ${existingCustomers.data[0].id}`);
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });

    console.log(`[Stripe] Customer ${customer.id} created for verified user ${user.id}`);
    return customer.id;
  } catch (error) {
    console.error('[Stripe] Failed to create customer:', error);
    return null;
  }
}

/**
 * Delete a Stripe customer (for cleanup of unverified users)
 */
export async function deleteStripeCustomer(customerId: string): Promise<boolean> {
  if (!isStripeConfigured() || !customerId) {
    return false;
  }

  try {
    const stripe = getStripeClient();
    await stripe.customers.del(customerId);
    console.log(`[Stripe] Customer ${customerId} deleted`);
    return true;
  } catch (error: any) {
    // Ignore "customer not found" errors
    if (error?.code === 'resource_missing') {
      return true;
    }
    console.error('[Stripe] Failed to delete customer:', error);
    return false;
  }
}

/**
 * Delete Stripe customer by email (for unverified user cleanup)
 */
export async function deleteStripeCustomerByEmail(email: string): Promise<boolean> {
  if (!isStripeConfigured()) {
    return true;
  }

  try {
    const stripe = getStripeClient();
    const customers = await stripe.customers.list({
      email: email,
      limit: 10,
    });

    // Delete all customers with this email (shouldn't be many)
    for (const customer of customers.data) {
      await stripe.customers.del(customer.id);
      console.log(`[Stripe] Deleted customer ${customer.id} for email ${email}`);
    }
    return true;
  } catch (error) {
    console.error('[Stripe] Failed to delete customers by email:', error);
    return false;
  }
}

// ============================================================================
// Webhook Events (for documentation)
// ============================================================================

export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
] as const;
