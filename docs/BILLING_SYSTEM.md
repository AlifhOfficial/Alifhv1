# Revvup Billing System

## Overview

The billing system is designed to be **simple and Stripe-centric**. Stripe is the source of truth for all subscription data - we don't maintain complex sync logic in our database.

## Data Model

### Partner Table (Key Fields)

| Field | Type | Description |
|-------|------|-------------|
| `tier` | `'flow' \| 'black'` | Current subscription plan |
| `stripeCustomerId` | `string` | Stripe customer ID (linked to user who registered) |
| `billingActive` | `boolean` | Is billing current? Controls staff access |
| `trialEndDate` | `timestamp` | Admin-set trial expiry date |
| `trialMonths` | `integer` | Number of trial months (for display) |
| `companyNameLegal` | `string` | Legal company name (used on invoices) |

### Plans

| Plan | Price | Black Listings | Staff Limit |
|------|-------|----------------|-------------|
| **Flow** | 7,000 AED/month | 1 | 5 |
| **Black** | 21,000 AED/month | 5 | Unlimited |

---

## Stripe Customer Lifecycle

### 1. User Registration (Before Partner)

```
User signs up with email
            ↓
Stripe customer created:
├── Name: User's personal name
├── Email: User's email
└── Metadata: { userId }
            ↓
stripeCustomerId saved to user table
```

At this point, the user is just a regular user - not a partner yet.

### 2. Partner Application & Approval

```
User applies to become partner
├── Enters companyNameLegal
├── Enters brandName
└── Other business details
            ↓
Admin reviews & approves
            ↓
Partner created:
├── tier = 'flow'
├── billingActive = true (during trial)
├── trialEndDate = now + X months
└── companyNameLegal = "ABC Trading LLC"
```

### 3. First Subscription Checkout (Name Update)

```
Partner owner clicks "Subscribe"
            ↓
Before creating checkout:
├── Stripe customer name UPDATED to companyNameLegal
└── Metadata updated with partnerId
            ↓
Stripe Checkout opens
├── Customer shows: "ABC Trading LLC"
├── Plan: Flow or Black
└── Billing address collected
            ↓
Invoices will now show:
├── Bill To: ABC Trading LLC
├── Email: owner@example.com
└── Address: (collected in checkout)
```

**This is the key moment** - the Stripe customer (originally created with personal name) gets updated to the company's legal name when they subscribe.

---

## User Flows

### 1. Partner Onboarding

```
User submits partner application
            ↓
Admin reviews & approves
            ↓
Admin sets trial duration (e.g., 3 months)
            ↓
Partner created:
├── tier = 'flow'
├── billingActive = true (during trial)
├── trialEndDate = now + 3 months
└── trialMonths = 3
```

### 2. During Trial Period

- Partner and staff have full access
- Billing page shows: "Founding access ends [date]"
- No payment required yet

### 3. Adding Payment Method

```
Partner clicks "Subscribe to Flow" or "Subscribe to Black"
            ↓
API: /api/partner/billing/checkout
├── Fetches partner.companyNameLegal
├── Updates Stripe customer name to companyNameLegal
└── Creates checkout session
            ↓
Redirects to Stripe Checkout
├── Customer: partner owner's stripeCustomerId
├── Name: partner.companyNameLegal (ABC Trading LLC)
├── Plan: flow or black
└── Trial end: honors remaining trial if same plan
            ↓
User enters card → Subscription created
            ↓
Webhook: checkout.session.completed
            ↓
Updates partner:
├── tier = 'flow' or 'black'
└── billingActive = true
```

### 4. Subscription Active

- Monthly billing to **company legal name**
- Invoices show: "Bill To: ABC Trading LLC"
- Invoices available in Stripe Portal
- Full platform access

### 5. Payment Failure

```
Stripe: invoice.payment_failed
            ↓
Webhook handler:
├── partner.billingActive = false (indirectly via staff suspension)
└── Suspends non-owner staff
            ↓
Staff see: "Billing inactive" error
Owner can still access partner dashboard to fix billing
```

### 6. Subscription Cancelled

```
Stripe: customer.subscription.deleted
            ↓
Webhook updates:
├── partner.tier = 'flow'
├── partner.billingActive = false
└── partner.blackListingQuota = 1
```

---

## Access Control

### Proxy-Level Gating

The middleware (`proxy.ts`) enforces access based on `billingActive`:

| Route | Who Can Access | Billing Check |
|-------|----------------|---------------|
| `/partner-dashboard/*` | **Owners only** | ❌ No (owner needs to fix billing) |
| `/staff-dashboard/*` | **Staff only** | ✅ Yes (blocked if inactive) |

### Logic

```typescript
// Staff blocked if billing inactive
if (pathname.startsWith("/staff-dashboard")) {
  if (!hasActiveBillingAsStaff(user)) {
    redirect("/access-denied?reason=billing-inactive");
  }
}

// Owners always allowed (need to fix billing)
if (pathname.startsWith("/partner-dashboard")) {
  // No billing check - owner must access to resolve
}
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/partner/billing/subscription` | GET | Get current plan status (auto-heals `billingActive`) |
| `/api/partner/billing/checkout` | POST | Create Stripe checkout session (updates customer name) |
| `/api/partner/billing/portal` | POST | Open Stripe billing portal |
| `/api/partner/billing/invoices` | GET | List invoices from Stripe |
| `/api/webhook/stripe` | POST | Handle Stripe webhook events |

### Auto-Heal: Subscription Status Sync

The `/api/partner/billing/subscription` endpoint automatically syncs `billingActive` with Stripe:

```typescript
// Determine if billing should be active
const shouldBeActive = 
  // Has active/trialing subscription
  (subscription && ['active', 'trialing'].includes(subscription.status)) ||
  // OR still in trial period (no subscription required yet)
  (trialEndDate && new Date(trialEndDate) > new Date());

// Auto-heal if mismatch detected
if (partner.billingActive !== shouldBeActive) {
  await db.update(partner).set({ billingActive: shouldBeActive });
}
```

This ensures data consistency even if:
- Webhooks were missed
- Database was migrated with incorrect defaults
- Manual database edits caused drift

---

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update `tier`, set `billingActive = true` |
| `customer.subscription.updated` | Update `tier`, enable staff if active/trialing |
| `customer.subscription.deleted` | Reset to flow, `billingActive = false` |
| `invoice.payment_failed` | Suspend non-owner staff |
| `invoice.paid` | Re-enable suspended staff |

---

## Key Design Decisions

1. **Stripe = Source of Truth**
   - No `subscription` table in database
   - Query Stripe directly for subscription details
   - Reduces sync complexity

2. **Bill to Company, Not User**
   - Stripe customer created during user registration (with personal name)
   - Customer name **updated to `companyNameLegal`** when partner subscribes
   - Invoices show company name, not personal name

3. **Admin-Controlled Trials**
   - No automatic trial periods
   - Admin sets `trialMonths` during approval
   - Flexible per-partner negotiation

4. **Graceful Degradation**
   - Staff blocked on payment failure
   - Owner keeps access to fix billing
   - No data loss - just access restriction

5. **Two Tiers Only**
   - `flow` (standard) and `black` (premium)
   - Removed legacy tiers (gold, platinum)

---

## Invoice Details

When a partner subscribes, their Stripe invoices will show:

```
INVOICE

Bill To:
  ABC Trading LLC          ← companyNameLegal
  owner@example.com        ← user email
  [Billing address]        ← collected during checkout

Plan: Revvup Flow
Amount: AED 7,000.00
```

---

## Files Changed (Billing Simplification)

| File | Change |
|------|--------|
| `packages/database/src/schema/partner.ts` | Added `stripeCustomerId`, `billingActive`; simplified `tier` enum |
| `packages/database/src/schema/subscription.ts` | **Deleted** (Stripe is source of truth) |
| `apps/web/src/lib/stripe/config.ts` | Added `businessName` param to `createStripeCustomerForUser` |
| `apps/web/src/app/api/partner/billing/checkout/route.ts` | Updates Stripe customer name to `companyNameLegal` before checkout |
| `apps/web/src/app/api/webhook/stripe/route.ts` | Added staff disabling, `billingActive` updates |
| `apps/web/src/proxy.ts` | Added billing check for staff-dashboard |
| `apps/web/src/lib/auth/routing.ts` | Added `hasActiveBillingAsStaff()` helper |
| `apps/web/src/lib/auth/index.ts` | Added `billingActive` to session data |
| `apps/web/src/app/access-denied/page.tsx` | Added `billing-inactive` error page |
