/**
 * Subscription Schema
 * Stripe subscription management for Alifh partners
 * 
 * Plans:
 * - Alifh Core: 7,000 AED/month
 * - Alifh Black: 21,000 AED/month
 * 
 * @module schema/subscription
 */

import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { partner } from './partner';

/**
 * Subscription Table
 * Tracks Stripe subscriptions for partners
 * 
 * referenceId = partner.id (not user.id)
 * Only partner owners can manage subscriptions
 */
export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  
  // Plan info
  plan: text('plan').notNull(), // 'core' | 'black'
  
  // Reference to partner (not user)
  referenceId: text('reference_id').notNull(), // partner.id
  
  // Stripe identifiers
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  
  // Subscription status
  // 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused'
  status: text('status').default('incomplete').notNull(),
  
  // Billing period
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  
  // Cancellation tracking
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancelAt: timestamp('cancel_at'),
  canceledAt: timestamp('canceled_at'),
  endedAt: timestamp('ended_at'),
  
  // Team/seats (not used for Alifh, but keeping for compatibility)
  seats: integer('seats'),
  
  // Trial tracking (not used, but required by Better Auth Stripe)
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('subscription_referenceId_idx').on(table.referenceId),
  index('subscription_stripeCustomerId_idx').on(table.stripeCustomerId),
  index('subscription_stripeSubscriptionId_idx').on(table.stripeSubscriptionId),
  index('subscription_status_idx').on(table.status),
  index('subscription_plan_idx').on(table.plan),
  // Composite for finding active subscriptions for a partner
  index('subscription_referenceId_status_idx').on(table.referenceId, table.status),
]);

/**
 * Subscription Relations
 */
export const subscriptionRelations = relations(subscription, ({ one }) => ({
  // Reference to partner
  partner: one(partner, {
    fields: [subscription.referenceId],
    references: [partner.id],
  }),
}));
