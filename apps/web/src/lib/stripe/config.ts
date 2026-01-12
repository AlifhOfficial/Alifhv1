/**
 * Stripe Configuration
 * 
 * SINGLE SOURCE OF TRUTH for Alifh subscription plans.
 * All components should import from here.
 * 
 * Plans:
 * - Alifh Flow: 7,000 AED/month (3 months free trial)
 * - Alifh Black: 21,000 AED/month (1 month free trial)
 * 
 * @module lib/stripe/config
 */

import Stripe from 'stripe';

// ============================================================================
// Stripe Client
// ============================================================================

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

/** All Alifh subscription plans */
export const PLANS: Record<PlanName, PlanConfig> = {
  flow: {
    name: 'flow',
    displayName: 'Alifh Flow',
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
    displayName: 'Alifh Black',
    priceAED: 21000,
    description: 'Premium features for high-volume dealers',
    freeMonths: 1, // 21k credits / 21k = 1 month
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
